import htm from "htm";

const vnodeSymbol = Symbol("vnode");

type VNode = {
  type: string;
  props: Record<string, string | Signal | Function>;
  children: VNode[] | string;
  [vnodeSymbol]: true;
};

function h(type: VNode["type"], props: VNode["props"], ...children: VNode[]) {
  return { type, props, children, [vnodeSymbol]: true };
}

function isVNode(value: unknown): value is VNode {
  return value !== null && typeof value === "object" && vnodeSymbol in value;
}

export class Conditional<TSignal = unknown> {
  private node: Node | undefined;
  public parentNode: Node | undefined | null;
  private rendered = false;

  constructor(
    signal: Signal<TSignal>,
    predicate: (value: TSignal) => boolean,
    vNode: VNode
  ) {
    signal.subscribe((value) => {
      if (!this.parentNode) {
        return;
      }

      if (predicate(value)) {
        if (this.rendered) {
          return;
        }

        this.node = render(this.parentNode, vNode);

        this.rendered = true;
      } else {
        if (!this.rendered || !this.node) {
          return;
        }

        this.parentNode.removeChild(this.node);

        this.rendered = false;
      }
    });
  }
}

interface Routes {
  [key: string]:
    | VNode
    | ((data: { urlParams: Params; searchParams: URLSearchParams }) => VNode);
}

type Params = Record<string, string>;

export class Router {
  private pathname = new Signal(window.location.pathname);
  private node: Node | undefined;
  public parentNode: Node | undefined;

  constructor(private routes: Routes) {
    // Listen for back/forward navigation
    window.addEventListener("popstate", () => {
      this.pathname.value = window.location.pathname;
    });

    window.addEventListener("route", (event) => {
      window.history.pushState(
        null,
        "",
        (event as CustomEvent<{ href: string }>).detail.href
      );

      this.pathname.value = window.location.pathname;
    });

    this.pathname.subscribe((pathname) => {
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

      if (this.node) {
        this.parentNode.removeChild(this.node);
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
          })
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
  constructor(private _value: Value, private handlers: Function[] = []) {}

  subscribe(fn: (value: Value) => void) {
    this.handlers.push(fn);

    fn(this._value);

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
  node?: VNode | string | Signal | Node | null | Conditional | VNode[]
) {
  // Render primitives first to ensure 0, false, "", etc  are rendered.
  if (node === null || node === undefined) {
    return;
  } else if (node instanceof Signal) {
    const textNode = document.createTextNode(String(node.value));

    const handler = (value: unknown) => {
      textNode.nodeValue = String(value);
    };

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

    // TODO: Should we support other node types?
    return;
  } else if (node instanceof Conditional || node instanceof Router) {
    node.parentNode = element;

    return;
    // TODO: Prove this only happens when there is no root node.
  } else if (Array.isArray(node)) {
    const el = document.createElement("span");

    for (const child of node) {
      render(el, child);
    }

    element.appendChild(el);

    return el;
  } else if (node instanceof Promise) {
    const el = document.createElement("span");

    node.then((resolvedNode) => {
      render(el, resolvedNode);
    });

    return element.appendChild(el);
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

          continue;
        }

        el.setAttribute(key, value);
      }
    }

    if (node.type === "a") {
      const href = el.getAttribute("href");

      el.addEventListener("click", (event) => {
        event.preventDefault();

        if (href) {
          window.dispatchEvent(new CustomEvent("route", { detail: { href } }));
        }
      });
    }

    for (const child of node.children) {
      render(el, child);
    }

    return element.appendChild(el);
  } else {
    const textNode = document.createTextNode(node.toString());

    return element.appendChild(textNode);
  }
}
