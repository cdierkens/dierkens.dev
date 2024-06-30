import { Template, _mount } from "./html";
import { Signal } from "./signal";

export interface ComponentHooks {
  onMount?: () => void;
  onCleanup?: () => void;
}

interface RenderFunction<Props> {
  (
    props: Props,
    onMount: (fn: () => void) => void,
    onCleanup: (fn: () => void) => void,
    root: Node,
  ): Template | null;
}

export class Component<Props = {}> {
  private _root: Node | undefined;
  private node: Node | Node[] | undefined;
  private hooks: ComponentHooks | undefined;
  private props: Props;
  private render: RenderFunction<Props>;

  private onMountCallbacks: (() => void)[] = [];
  private onCleanupCallbacks: (() => void)[] = [];

  get root() {
    return this._root;
  }

  constructor(render: RenderFunction<Props>, props?: Props) {
    this.render = render;
    this.props = props || ({} as Props);

    for (const key in props) {
      const prop = props[key];

      if (prop instanceof Signal) {
        const update = () => {
          this.update(this.props);
        };

        prop.subscribe(update);

        this.onCleanup(() => {
          prop.unsubscribe(update);
        });
      }
    }

    return this;
  }

  // TODO: This pattern only allows 1 onMount and 1 onCleanup.
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
    const template = this.render(
      props,
      (fn) => this.onMount(fn),
      (fn) => this.onCleanup(fn),
      this.root!,
    );

    if (!this.node) {
      return;
    }

    const parentNode = Array.isArray(this.node)
      ? this.node[0].parentNode
      : this.node.parentNode;

    if (!parentNode || !template) {
      return;
    }

    const nodes = _mount(document.createElement("span"), template, this._root);
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

  public mount(element: Node, root: Node): Node | Node[] {
    const template = this.render(
      this.props,
      (fn) => this.onMount(fn),
      (fn) => this.onCleanup(fn),
      root,
    );

    if (!template) {
      return element;
    }

    this._root = root;
    this.node = _mount(element, template, root);

    this.onMountCallbacks.forEach((fn) => fn());
    if (this.hooks?.onMount) {
      this.hooks.onMount();
    }

    new MutationObserver((record) => {
      record.forEach((mutation) => {
        mutation.removedNodes.forEach((removedNode) => {
          if (removedNode === this.node) {
            if (this.hooks?.onCleanup) {
              this.hooks.onCleanup();
            }
            this.onCleanupCallbacks.forEach((fn) => fn());

            this.onCleanupCallbacks = [];
            this.onMountCallbacks = [];
          }
        });
      });
    }).observe(element, {
      childList: true,
    });

    return this.node;
  }
}

export function createComponent(
  render: RenderFunction<undefined>,
  options?: { initialProps: {} },
): () => Component;

export function createComponent<Props>(
  render: RenderFunction<Props>,
  options?: { initialProps: Partial<Props> },
): (props: Props) => Component<Props>;

export function createComponent<Props>(
  render: RenderFunction<Props>,
  { initialProps }: { initialProps: Partial<Props> } = { initialProps: {} },
): (props: Props) => Component<Props> {
  return function (props: Props) {
    return new Component(render, { ...initialProps, ...props });
  };
}
