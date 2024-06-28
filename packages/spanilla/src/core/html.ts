import htm from "htm";
import { Component, createComponent } from "./component";
import { Signal } from "./signal";

const symbol = Symbol.for("VNode");

export type Template = VNode | VNode[];

export interface VNode {
  type: string;
  props: Record<string, string | Signal | Function | true>;
  children: VNode[];
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

export const html: (
  strings: TemplateStringsArray,
  ...values: any[]
) => Template = htm.bind(h);

interface MountOptions {
  replace?: boolean;
}

export function mount(
  element: Node,
  template: Template,
  { replace }: MountOptions = {
    replace: false,
  },
): Node | Node[] {
  // TODO: Should only add 1 event listener, not 1 per mount.
  element.addEventListener("route", (event) => {
    const href = (event as CustomEvent).detail.href;

    if (href) {
      window.history.pushState({}, "", href);
    }
  });

  if (replace) {
    element.textContent = "";
  }

  return _mount(element, template);
}

// TODO: No recursion.
function _mount(
  element: Node,
  node: boolean | number | Signal | string | Template | (() => Template),
): Node | Node[] {
  if (typeof node === "string") {
    return element.appendChild(document.createTextNode(node));
  } else if (typeof node === "number" || typeof node === "boolean") {
    return element.appendChild(document.createTextNode(String(node)));
  } else if (node === undefined || node === null) {
    return element;
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
    }).observe(element, {
      childList: true,
    });

    return element.appendChild(textNode);
  } else if (Array.isArray(node)) {
    return node.flatMap((child) => _mount(element, child));
  } else if (isVNode(node)) {
    const el = document.createElement(node.type);

    if (node.props) {
      for (const [key, value] of Object.entries(node.props)) {
        if (typeof value === "function") {
          el.addEventListener(key.slice(2), (event) => {
            value(event);
          });
        } else if (value instanceof Signal) {
          value.subscribe((value: unknown) => {
            el.setAttribute(key, String(value));
          });

          el.setAttribute(key, String(value.value));
        } else if (typeof value === "boolean") {
          if (value) {
            el.setAttribute(key, "");
          }
        } else {
          el.setAttribute(key, value);
        }
      }
    }

    if (node.type === "a") {
      el.addEventListener("click", (event) => {
        const href = (event.currentTarget as HTMLElement).getAttribute("href");

        const url = new URL(href || "", window.location.origin);

        if (href && url.origin === window.location.origin) {
          event.preventDefault();
          el.dispatchEvent(
            new CustomEvent("route", { detail: { href }, bubbles: true }),
          );
        }
      });
    }

    for (const child of node.children) {
      _mount(el, child);
    }

    return element.appendChild(el);
  } else if (node instanceof Component) {
    return node.mount(element);
  } else if (typeof node === "function") {
    const component = createComponent(node);
    return component().mount(element);
  } else {
    const textNode = document.createTextNode(String(node));

    return element.appendChild(textNode);
  }
}
