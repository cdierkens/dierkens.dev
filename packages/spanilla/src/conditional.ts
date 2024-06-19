import { Component, Mountable, mount } from "./html";
import { Signal } from "./signal";

// TODO: Conditional could have a 'fallback' vNode prop.
export class Conditional<TSignal = unknown> implements Mountable {
  private node: Node | undefined;
  private parentNode: Node | undefined | null;
  private rendered: boolean;

  constructor(
    private signal: Signal<TSignal>,
    private predicate: (value: TSignal) => boolean,
    private vNode: Component | Component[],
  ) {
    this.rendered = false;

    signal.subscribe((value) => this.update(value));
  }

  mount(node: Node): Node {
    this.parentNode = node;
    this.node = node.appendChild(document.createTextNode(""));

    this.update(this.signal.value);

    return this.node;
  }

  private update(value: TSignal) {
    if (!this.parentNode) {
      return;
    }

    if (this.predicate(value)) {
      if (this.rendered) {
        return;
      }

      // TODO: Benefits from a mount one  function.
      const newNode = mount(document.createElement("span"), this.vNode) as Node;

      this.parentNode.replaceChild(newNode, this.node as Node);
      this.node = newNode;

      this.rendered = true;
    } else {
      if (!this.rendered || !this.node) {
        return;
      }

      const newNode = document.createTextNode("");
      this.parentNode.replaceChild(newNode, this.node as Node);
      this.node = newNode;

      this.rendered = false;
    }
  }
}
