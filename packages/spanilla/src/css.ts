import { Signal } from "./signal";

if (!globalThis.window) {
  const { JSDOM } = require("jsdom");

  const dom = new JSDOM("");
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.MutationObserver = dom.window.MutationObserver;
  globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;
}

interface vCSSRule {
  selector: string;
  declarations: vCSSDeclaration[];
  signals?: Signal[];
  id: number;
}

interface vCSSDeclaration {
  property: string;
  value: string | Array<string | Signal>;
  priority?: string;
}

export function css(
  strings: TemplateStringsArray,
  ...values: any[]
): vCSSRule[] {
  const parts = strings.reduce((acc: Array<string | any>, str, i) => {
    const trimmed = removeWhitespace(str);
    if (trimmed) {
      acc.push(trimmed);
    }

    if (values[i]) {
      acc.push(values[i]);
    }

    return acc;
  }, []);

  const rules: vCSSRule[] = [];

  let rule: Partial<vCSSRule> & Pick<vCSSRule, "id"> = {
    id: rules.length,
  };
  let vCSSDeclaration: Partial<vCSSDeclaration> = {};

  let context: "selector" | "property" | "value" | "priority" = "selector";

  let chunks: string[] = [];
  for (const part of parts) {
    if (typeof part === "string") {
      for (let index = 0; index < part.length; index++) {
        const char = part[index];
        if (context === "selector" && char === "{") {
          context = "property";

          rule.selector = stringify(chunks);

          chunks = [];
        } else if (context === "property" && char === ":") {
          context = "value";

          vCSSDeclaration.property = stringify(chunks);

          chunks = [];
        } else if (context === "value" && char === ";") {
          context = "property";

          vCSSDeclaration.value = vCSSDeclaration.value || [];

          vCSSDeclaration.value = compact(chunks);

          rule.declarations = rule.declarations || [];

          rule.declarations.push(vCSSDeclaration as vCSSDeclaration);

          vCSSDeclaration = {};
          chunks = [];
        } else if (context === "value" && char === "!") {
          vCSSDeclaration.value = vCSSDeclaration.value || [];
          vCSSDeclaration.value = compact(chunks);
          chunks = [];

          context = "priority";
        } else if (context === "priority" && char === ";") {
          context = "property";

          vCSSDeclaration.priority = stringify(chunks);

          rule.declarations = rule.declarations || [];
          rule.declarations.push(vCSSDeclaration as vCSSDeclaration);
          vCSSDeclaration = {};
          chunks = [];
        } else if (char === "}") {
          if (context === "value") {
            vCSSDeclaration.value = vCSSDeclaration.value || [];
            vCSSDeclaration.value = compact(chunks);
            chunks = [];
          }

          rule.declarations = rule.declarations || [];

          rules.push(rule as vCSSRule);
          rule = {
            id: rules.length,
          };
          context = "selector";
        } else {
          chunks.push(char);
        }
      }
    } else if (context === "value") {
      if (part instanceof Signal) {
        rule.signals = rule.signals || [];
        rule.signals.push(part);
      }

      chunks.push(part);
    } else {
      throw new Error("Unexpected value");
    }
  }

  return rules;
}

function stringify(values: any[]): string {
  return removeWhitespace(values.join(""));
}

function removeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function createStyleSheet(rules: vCSSRule[]) {
  const styleSheet = new CSSStyleSheet();

  for (let index = 0; index < rules.length; index++) {
    const rule = rules[index];

    function render() {
      return `${rule.selector} { ${rule.declarations
        .map(
          (rule) =>
            `${rule.property}: ${Array.isArray(rule.value) ? stringify(rule.value) : rule.value}${rule.priority ? ` !${rule.priority}` : ""}`,
        )
        .join("; ")} }`;
    }

    const cssRule = render();

    const id = styleSheet.insertRule(cssRule, index);

    if (Array.isArray(rule.signals)) {
      for (const signal of rule.signals) {
        signal.subscribe(() => {
          styleSheet.deleteRule(id);
          styleSheet.insertRule(render(), id);
        });
      }
    }
  }

  return styleSheet;
}

export function adopt(rules: vCSSRule[]) {
  const styleSheet = createStyleSheet(rules);

  document.adoptedStyleSheets = document.adoptedStyleSheets
    ? [...document.adoptedStyleSheets, styleSheet]
    : [styleSheet];

  return styleSheet;
}

export function render(rules: vCSSRule[]) {
  const styleSheet = createStyleSheet(rules);

  return Array.from(styleSheet.cssRules)
    .map((rule) => rule.cssText)
    .join(" ");
}

function compact(array: Array<string | Signal>) {
  let prevIndex = 0;
  const compacted = [];
  for (let index = 0; index < array.length; index++) {
    if (array[index] instanceof Signal) {
      if (prevIndex !== index) {
        compacted.push(stringify(array.slice(prevIndex, index)));
      }
      prevIndex = index + 1;

      compacted.push(array[index]);
    }
  }

  if (compacted.length === 0) {
    return stringify(array);
  }

  return compacted;
}
