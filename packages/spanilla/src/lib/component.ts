import { adopt, isVStyleSheet } from "./css";
import { VNode, isVNode } from "./html";
import { Signal } from "./signal";

type Template = VNode | Array<VNode>;

interface ComponentHooks {
  onMount?: () => void;
  onCleanup?: () => void;
}

class Component<Props = unknown> {
  private node: Node | Node[] | undefined;
  private hooks: ComponentHooks | undefined;
  private props: Props;
  private render: (props: Props) => Template;

  constructor(init: {
    render: (props: Props) => Template;
    props?: Props;
    hooks?: ComponentHooks;
  }) {
    this.render = init.render;
    this.props = init.props || ({} as Props);

    if (init.hooks) {
      this.hooks = init.hooks;
    }
  }

  public update(props: Props) {
    this.props = props;
    const template = this.render(props);

    if (!this.node) {
      return;
    }

    const parentNode = Array.isArray(this.node)
      ? this.node[0].parentNode
      : this.node.parentNode;

    if (!parentNode) {
      return;
    }

    const nodes = mount(document.createElement("span"), template);
    if (Array.isArray(nodes)) {
      parentNode.replaceChildren(...nodes);
      this.node = nodes;
    } else if (Array.isArray(this.node)) {
      parentNode.replaceChildren(nodes);
      this.node = nodes;
    } else {
      parentNode.replaceChild(nodes, this.node);
      this.node = nodes;
    }
  }

  public mount(element: Node): Node | Node[] {
    const template = this.render(this.props);
    this.node = mount(element, template);

    if (this.hooks?.onMount) {
      this.hooks.onMount();
    }

    if (this.hooks?.onCleanup) {
      const onCleanup = this.hooks?.onCleanup;
      new MutationObserver((record) => {
        record.forEach((mutation) => {
          mutation.removedNodes.forEach((removedNode) => {
            if (removedNode === this.node) {
              onCleanup();
            }
          });
        });
      }).observe(element, {
        childList: true,
      });
    }

    return this.node;
  }
}

/**
 * Creates a component.
 *
 * @param {function} render - The render function. This function should return a template.
 * It also defines what props the component accepts.
 * @param {['key', ...]} watch - An array of prop keys whose values are signals to watch for
 * changes. If the matching signal changes, the component will re-render.
 * @returns A component function which accepts props, and component lifecycle
 * hooks.
 *
 * @example
 * const Counter = createComponent(({count, children}: CounterProps) => {
 * 	function incrementCount() {
 * 		count.value++
 * 	}
 *
 * 	return html`
 * 		<p>The count is ${count}</p>
 * 		<button onclick="${incrementCount}">
 * 			${children}
 * 		</button>
 * 	`
 * })
 *
 * html`
 * 	<div>
 * 		${Counter({
 * 			children: html`Increment the count!`,
 * 			count: createSignal(0)
 * 		}, {
 * 			onMount: () => console.log('on mount'),
 * 			onCleanup: () => console.log('on cleanup')
 * 		})}
 * 	</div>
 * `
 *
 * @example
 * const Show = createComponent(
 *     (props: { show: Signal<boolean> }) => {
 *       return props.show.value
 *         ? html`<p>Hello, World!</p>`
 *         : html`<p>Goodbye, World!</p>`;
 *     },
 *     ["show"],
 *   );
 *
 * const show = Signal(true);
 *
 * html`${Show({ show })}`; // <p>Hello, World!</p>
 *
 * show.value = false;
 *
 * html`${Show({ show })}`; // <p>Goodbye, World!</p>
 *
 **/
export function createComponent(
  render: () => Template,
): (hooks?: ComponentHooks) => Component;

export function createComponent<Props>(
  render: (props: Props) => Template,
  watch?: [KeysOfType<Props, Signal>],
): (props: Props, hooks?: ComponentHooks) => Component<Props>;

export function createComponent<Props>(
  render: (props?: Props) => Template,
  watch?: [KeysOfType<Props, Signal>],
) {
  if (render.arguments.length === 1) {
    return function (props: Props, hooks?: ComponentHooks) {
      const component = new Component({ render, props, hooks });

      if (watch) {
        for (const key of watch) {
          if (props) {
            const prop = props[key];

            if (prop instanceof Signal) {
              prop.subscribe(() => {
                component.update(props);
              });
            }
          }
        }
      }

      return component;
    };
  } else {
    return function (hooks?: ComponentHooks) {
      return new Component({ render, hooks });
    };
  }
}

type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// TODO: No recursion.
export function mount(
  element: Node,
  node:
    | Template
    | string
    | Signal
    | string
    | number
    | boolean
    | (() => Component),
  root: Node = element,
): Node | Node[] {
  if (typeof node === "string") {
    return element.appendChild(document.createTextNode(node));
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
  } else if (typeof node === "number" || typeof node === "boolean") {
    return element.appendChild(document.createTextNode(String(node)));
  } else if (Array.isArray(node)) {
    return node.flatMap((child) => mount(element, child, root));
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
  } else if (node instanceof Component) {
    return node.mount(element);
  } else {
    const textNode = document.createTextNode(String(node));

    return element.appendChild(textNode);
  }
}

// type CounterProps = { count: Signal<number> }

// const Counter = createComponent(({count}: CounterProps) => {
// 	function incrementCount() {
// 		count.value++
// 	}

// 	return html`
// 		<p>The count is ${count}</p>
// 		<button onclick="${incrementCount}">
// 			Increment the count!
// 		</button>
// 	`
// });
