import { Template, mount } from "./html";
import { Signal } from "./signal";

interface ComponentHooks {
  onMount?: () => void;
  onCleanup?: () => void;
}

export class Component<Props = unknown> {
  private node: Node | Node[] | undefined;
  private hooks: ComponentHooks | undefined;
  private props: Props;
  private render: (props: Props) => Template;

  constructor(render: (props: Props) => Template, props?: Props) {
    this.render = render;
    this.props = props || ({} as Props);

    return this;
  }

  onMount(fn: () => void) {
    this.hooks = { ...this.hooks, onMount: fn };
    return this;
  }

  onCleanup(fn: () => void) {
    this.hooks = { ...this.hooks, onCleanup: fn };
    return this;
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
export function createComponent(render: () => Template): () => Component;

export function createComponent<Props>(
  render: (props: Props) => Template,
  watch?: [KeysOfType<Props, Signal>],
): (props: Props) => Component<Props>;

export function createComponent<Props>(
  render: (props?: Props) => Template,
  watch?: [KeysOfType<Props, Signal>],
) {
  return function (props: Props) {
    const component = new Component(render, props);

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
}

type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
