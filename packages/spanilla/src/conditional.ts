import { Mountable, Mountee, mount } from "./html";
import { Signal } from "./signal";

export class Conditional<TSignal = unknown> implements Mountable {
  private node: Node | undefined;
  private parentNode: HTMLElement | undefined | null;
  private rendered: boolean;

  constructor(
    private signal: Signal<TSignal>,
    private predicate: (value: TSignal) => boolean,
    private vNode: Mountee,
  ) {
    this.rendered = false;

    signal.subscribe((value) => this.update(value));
  }

  mount(element: HTMLElement): void {
    this.parentNode = element;
    this.node = document.createTextNode("");

    element.appendChild(this.node);

    this.update(this.signal.value);
  }

  private update(value: TSignal) {
    if (!this.parentNode) {
      return;
    }

    if (this.predicate(value)) {
      if (this.rendered) {
        return;
      }

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
