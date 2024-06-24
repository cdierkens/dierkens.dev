import { Template, mount } from "../core/html";

export function render(template: Template): string {
  const element = document.createElement("div");

  mount(element, template);

  // TODO: This is a hack to get the doctype to render. Too much magic?
  if (element.children.length === 1 && element.children[0].tagName === "HTML") {
    return `<!DOCTYPE html>${element.innerHTML}`;
  }

  return element.innerHTML;
}
