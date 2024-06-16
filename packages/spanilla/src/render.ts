import { Mountee, mount } from "./mount";

export function render(node: Mountee) {
  const element = document.createElement("div");

  mount(element, node);

  return element.innerHTML;
}
