import htm from "htm";
import { Conditional } from "./conditional";
import { VStyleSheet, adopt, isVStyleSheet } from "./css";
import { Router } from "./router";
import { Signal } from "./signal";

const symbol = Symbol.for("VNode");

export interface VNode {
  type: string;
  props: Record<string, string | Signal | Function | true | VStyleSheet>;
  children: VNode[] | string;
  [symbol]: true;
}

export function h(
  type: VNode["type"],
  props: VNode["props"],
  ...children: VNode[]
): VNode {
  return { type, props, children, [symbol]: true as const };
}

export function isVNode(value: unknown): value is VNode {
  return value !== null && typeof value === "object" && symbol in value;
}

export const html = htm.bind(h);

export interface Mountable {
  mount(element: Node): Node;
}

// TODO: Store, If, For, Async.
// TODO: primitives and promises are not components.
export type Component =
  | Signal
  | Conditional
  | Router
  | VNode
  | string
  | number
  | boolean
  | Promise<Component | Component[]>;

// Note: root is used for event delegation.
// TODO: Break this up into the external mount function, mount children, and mount one.
export function mount(
  element: Node,
  component: Component | Component[],
  root: Node = element,
): Node | Node[] {
  if (component instanceof Signal) {
    const textNode = document.createTextNode(String(component.value));

    const handler = (value: unknown) => {
      textNode.nodeValue = String(value);
    };

    // Subscribe to the signal during the initial render before the
    // MutationObserver takes over.
    component.subscribe(handler);
    setTimeout(() => {
      component.unsubscribe(handler);
    }, 0);

    new MutationObserver((record) => {
      record.forEach((mutation) => {
        mutation.addedNodes.forEach((addedNode) => {
          if (addedNode === textNode) {
            component.subscribe(handler);
          }
        });

        mutation.removedNodes.forEach((removedNode) => {
          if (removedNode === textNode) {
            component.unsubscribe(handler);
          }
        });
      });

      textNode.nodeValue = String(component.value);
    }).observe(element, {
      childList: true,
    });

    return element.appendChild(textNode);
  } else if (component instanceof Conditional) {
    return component.mount(element);
  } else if (component instanceof Router) {
    root.addEventListener("route", (event) => {
      window.history.pushState(
        null,
        "",
        (event as CustomEvent<{ href: string }>).detail.href,
      );

      component.pathname.value = window.location.pathname;
    });

    return component.mount(element);
  } else if (Array.isArray(component)) {
    return component.flatMap((child) => mount(element, child, root));
  } else if (component instanceof Promise) {
    component.then((resolvedNode) => {
      mount(element, resolvedNode, root);
    });

    // TODO: Nothing is appended until the promise resolves.
    return element;
  } else if (isVNode(component)) {
    const el = document.createElement(component.type);

    if (component.props) {
      for (const [key, value] of Object.entries(component.props)) {
        if (typeof value === "function") {
          el.addEventListener(key.slice(2), (event) => {
            value(event);
          });
        } else if (value instanceof Signal) {
          value.subscribe((value: unknown) => {
            el.setAttribute(key, String(value));
          });

          el.setAttribute(key, String(value.value));
        } else if (value === true) {
          el.setAttribute(key, "");
        } else if (isVStyleSheet(value)) {
          if (key !== "style") {
            throw new Error("Only class is supported for stylesheets.");
          }

          el.classList.add(value.class);

          const isJSDOM = window.navigator.userAgent.includes("jsdom");

          if (!isJSDOM) {
            adopt(value);
          }
        } else {
          el.setAttribute(key, value);
        }
      }
    }

    if (component.type === "a") {
      el.addEventListener("click", (event) => {
        const href = (event.currentTarget as HTMLElement).getAttribute("href");

        const url = new URL(href || "", window.location.origin);

        if (href && url.origin === window.location.origin) {
          event.preventDefault();
          root.dispatchEvent(new CustomEvent("route", { detail: { href } }));
        }
      });
    }

    for (const child of component.children) {
      mount(el, child, root);
    }

    return element.appendChild(el);
  } else {
    const textNode = document.createTextNode(component.toString());

    return element.appendChild(textNode);
  }
}

export function render(vNode: Component | Component[]): string {
  const element = document.createElement("div");

  mount(element, vNode);

  // TODO: This is a hack to get the doctype to render. Too much magic?
  if (element.children.length === 1 && element.children[0].tagName === "HTML") {
    return `<!DOCTYPE html>${element.innerHTML}`;
  }

  return element.innerHTML;
}
