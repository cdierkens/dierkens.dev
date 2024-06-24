import { generateId } from "./id";
import { Signal } from "./signal";

const symbol = Symbol.for("VStylesheet");

export function isVStyleSheet(value: unknown): value is VStyleSheet {
  return value !== null && typeof value === "object" && symbol in value;
}

export interface VStyleSheet {
  class: string;
  rules: VStyleRule[];
  [symbol]: true;
}

interface VStyleRule {
  selector: string;
  declarations: VStyleDeclaration[];
  signals?: Signal[];
  id: number;
}

interface VStyleDeclaration {
  property: string;
  value: string | Array<string | Signal>;
  priority?: string;
}

export function css(
  strings: TemplateStringsArray,
  ...values: any[]
): VStyleSheet {
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

  const styleSheet: VStyleSheet = {
    class: generateId(),
    rules: [],
    [symbol]: true,
  };

  let rule: Partial<VStyleRule> & Pick<VStyleRule, "id"> = {
    id: styleSheet.rules.length,
  };
  let vCSSDeclaration: Partial<VStyleDeclaration> = {};

  let context: "selector" | "property" | "value" | "priority" = "selector";

  let chunks: string[] = [];
  for (const part of parts) {
    if (typeof part === "string") {
      for (let index = 0; index < part.length; index++) {
        const char = part[index];
        if (context === "selector" && char === "{") {
          context = "property";

          let selector = stringify(chunks);

          if (selector.includes("&")) {
            selector = selector.replace(/&/g, `.${styleSheet.class}`);
          } else {
            selector = `.${styleSheet.class} ${selector.split(",").join(`, .${styleSheet.class}`)}`;
          }

          rule.selector = selector;

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

          rule.declarations.push(vCSSDeclaration as VStyleDeclaration);

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
          rule.declarations.push(vCSSDeclaration as VStyleDeclaration);
          vCSSDeclaration = {};
          chunks = [];
        } else if (char === "}") {
          if (context === "value") {
            vCSSDeclaration.value = vCSSDeclaration.value || [];
            vCSSDeclaration.value = compact(chunks);
            chunks = [];
          }

          rule.declarations = rule.declarations || [];

          styleSheet.rules.push(rule as VStyleRule);
          rule = {
            id: styleSheet.rules.length,
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

  return styleSheet;
}

function stringify(values: any[]): string {
  return removeWhitespace(values.join(""));
}

function removeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function createStyleSheet(vStyleSheet: VStyleSheet) {
  const styleSheet = new CSSStyleSheet();

  for (let index = 0; index < vStyleSheet.rules.length; index++) {
    const rule = vStyleSheet.rules[index];

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
