import { Conditional } from "./conditional";
import { VNode, isVNode } from "./html";
import { Router } from "./router";
import { Signal } from "./signal";

export interface Mountable {
  mount(element: HTMLElement): void;
}

export type Mountee =
  | VNode
  | string
  | Signal
  | Node
  | null
  | Conditional
  | VNode[]
  | HTMLElement;

export function mount(element: HTMLElement, node?: Mountee, root = element) {
  // Mount primitives first to ensure 0, false, "", etc are in the dom.
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
    node.mount(element);
    return;
    // TODO: Prove this only happens when there is no root node.
  } else if (node instanceof Router) {
    node.mount(element);

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
      mount(element, child, root);
    }

    return;
  } else if (node instanceof Promise) {
    node.then((resolvedNode) => {
      mount(element, resolvedNode, root);
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
      mount(el, child, root);
    }

    return element.appendChild(el);
  } else {
    const textNode = document.createTextNode(node.toString());

    return element.appendChild(textNode);
  }
}
