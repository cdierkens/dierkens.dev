import htm from "htm";

if (!globalThis.window) {
  const { JSDOM } = require("jsdom");

  const dom = new JSDOM("");
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.MutationObserver = dom.window.MutationObserver;
}

const vnodeSymbol = Symbol("vnode");

type VNode = {
  type: string;
  props: Record<string, string | Signal | Function>;
  children: VNode[] | string;
  [vnodeSymbol]: true;
};

function h(type: VNode["type"], props: VNode["props"], ...children: VNode[]) {
  return { type, props, children, [vnodeSymbol]: true as const };
}

function isVNode(value: unknown): value is VNode {
  return value !== null && typeof value === "object" && vnodeSymbol in value;
}

export class Conditional<TSignal = unknown> {
  private node: Node | undefined;
  private _parentNode: Node | undefined | null;
  private rendered: boolean;

  constructor(
    private signal: Signal<TSignal>,
    private predicate: (value: TSignal) => boolean,
    private vNode:
      | VNode
      | string
      | Signal
      | Node
      | null
      | Conditional
      | VNode[],
  ) {
    this.rendered = false;

    signal.subscribe((value) => this.render(value));
  }

  set parentNode(node: Node | undefined | null) {
    this._parentNode = node;

    this.render(this.signal.value);
  }

  render(value: TSignal) {
    if (!this._parentNode) {
      return;
    }

    if (this.predicate(value)) {
      if (this.rendered) {
        return;
      }

      this.node = render(this._parentNode, this.vNode);

      this.rendered = true;
    } else {
      if (!this.rendered || !this.node) {
        return;
      }

      this._parentNode.removeChild(this.node);

      this.rendered = false;
    }
  }
}

interface Routes {
  [key: string]:
    | (VNode | string | Signal | Node | null | Conditional | VNode[])
    | ((data: {
        urlParams: Params;
        searchParams: URLSearchParams;
      }) => VNode | string | Signal | Node | null | Conditional | VNode[]);
}

type Params = Record<string, string>;

export class Router {
  public pathname = new Signal(window.location.pathname);
  private node: Node | undefined;
  public parentNode: Node | undefined;

  constructor(private routes: Routes) {
    // Listen for back/forward navigation
    window.addEventListener("popstate", () => {
      this.pathname.value = window.location.pathname;
    });

    this.pathname.subscribe((pathname) => {
      if (this.node) {
        this.node.parentNode?.removeChild(this.node);
      }

      const key = Object.keys(this.routes).find((key) => {
        const parts = key.split("/");
        const pathnameParts = pathname.split("/");

        if (parts.length !== pathnameParts.length) {
          return false;
        }

        return parts.every((part, index) => {
          if (part.startsWith("{{") && part.endsWith("}}")) {
            return true;
          }

          return part === pathnameParts[index];
        });
      });

      const route = key ? this.routes[key] : undefined;

      if (!route || !this.parentNode || !key) {
        return;
      }

      if (route instanceof Function) {
        const values = pathname.split("/");
        const keys = key.split("/");
        const urlParams = values.reduce((acc: Params, value, index) => {
          const key = keys[index];
          const name = key.match(/^{{(.*?)}}?/);

          if (name) {
            acc[name[1]] = value;
          }

          return acc;
        }, {});

        this.node = render(
          this.parentNode,
          route({
            urlParams,
            searchParams: new URLSearchParams(window.location.search),
          }),
        );
      } else {
        this.node = render(this.parentNode, route);
      }
    });

    setTimeout(() => {
      this.pathname.value = window.location.pathname;
    });
  }
}

export class Signal<Value = unknown> {
  constructor(
    private _value: Value,
    private handlers: Function[] = [],
  ) {}

  subscribe(fn: (value: Value) => void) {
    this.handlers.push(fn);

    return this.handlers.length - 1;
  }

  unsubscribe(fn: (value: Value) => void) {
    const index = this.handlers.indexOf(fn);

    if (index === -1) {
      return;
    }

    this.handlers.splice(index, 1);
  }

  get value() {
    return this._value;
  }

  set value(_value: Value) {
    this._value = _value;

    this.handlers.forEach((fn) => fn(_value));
  }
}

export const html = htm.bind(h);

export function render(
  element: Node,
  node?: VNode | string | Signal | Node | null | Conditional | VNode[],
  root = element,
) {
  // Render primitives first to ensure 0, false, "", etc  are rendered.
  if (node === null || node === undefined) {
    return;
  } else if (node instanceof Signal) {
    const textNode = document.createTextNode(String(node.value));

    const handler = (value: unknown) => {
      textNode.nodeValue = String(value);
    };

    // Subscribe to the signal during the initial render before the
    // MutationObserver takes over.
    node.subscribe(handler);
    setTimeout(() => {
      node.unsubscribe(handler);
    }, 0);

    new MutationObserver((record) => {
      record.forEach((mutation) => {
        mutation.addedNodes.forEach((addedNode) => {
          if (addedNode === textNode) {
            node.subscribe(handler);
          }
        });

        mutation.removedNodes.forEach((removedNode) => {
          if (removedNode === textNode) {
            node.unsubscribe(handler);
          }
        });
      });

      textNode.nodeValue = String(node.value);
    }).observe(element, {
      childList: true,
    });

    return element.appendChild(textNode);
  } else if (node instanceof Node) {
    if (
      node.nodeType === Node.TEXT_NODE ||
      node.nodeType === Node.ELEMENT_NODE
    ) {
      return element.appendChild(node);
    }

    // TODO: Should we support other node types? Return element?
    return;
  } else if (node instanceof Conditional) {
    node.parentNode = element;
    return;
    // TODO: Prove this only happens when there is no root node.
  } else if (node instanceof Router) {
    node.parentNode = element;

    root.addEventListener("route", (event) => {
      window.history.pushState(
        null,
        "",
        (event as CustomEvent<{ href: string }>).detail.href,
      );

      node.pathname.value = window.location.pathname;
    });

    return;
  } else if (Array.isArray(node)) {
    for (const child of node) {
      render(element, child, root);
    }

    return;
  } else if (node instanceof Promise) {
    node.then((resolvedNode) => {
      render(element, resolvedNode, root);
    });

    return element;
  } else if (isVNode(node)) {
    const el = document.createElement(node.type);

    if (node.props) {
      for (const [key, value] of Object.entries(node.props)) {
        if (typeof value === "function") {
          el.addEventListener(key.slice(2), (event) => {
            value(event);
          });

          continue;
        }

        if (value instanceof Signal) {
          value.subscribe((value: unknown) => {
            el.setAttribute(key, String(value));
          });

          el.setAttribute(key, String(value.value));

          continue;
        }

        el.setAttribute(key, value);
      }
    }

    if (node.type === "a") {
      el.addEventListener("click", (event) => {
        const href = (event.currentTarget as HTMLElement).getAttribute("href");

        const url = new URL(href || "", window.location.origin);

        if (href && url.origin === window.location.origin) {
          event.preventDefault();
          root.dispatchEvent(new CustomEvent("route", { detail: { href } }));
        }
      });
    }

    for (const child of node.children) {
      render(el, child, root);
    }

    return element.appendChild(el);
  } else {
    const textNode = document.createTextNode(node.toString());

    return element.appendChild(textNode);
  }
}
