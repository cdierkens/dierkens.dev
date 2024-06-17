import { Mountable, Mountee, mount } from "./html";
import { Signal } from "./signal";

interface Routes {
  [key: string]:
    | Mountee
    | ((data: { urlParams: Params; searchParams: URLSearchParams }) => Mountee);
}

type Params = Record<string, string>;

export class Router implements Mountable {
  public pathname: Signal<string>;
  private node: Node | undefined;
  private parentNode: HTMLElement | undefined;

  constructor(private routes: Routes) {
    this.pathname = new Signal(window.location.pathname);

    // Listen for back/forward navigation
    window.addEventListener("popstate", () => {
      this.pathname.value = window.location.pathname;
    });

    this.pathname.subscribe((value) => this.update(value));

    setTimeout(() => {
      this.pathname.value = window.location.pathname;
    });
  }

  // TODO: This could be in an abstract class.
  mount(element: HTMLElement): void {
    this.parentNode = element;
    this.node = document.createTextNode("");

    element.appendChild(this.node);

    this.update(this.pathname.value);
  }

  update(pathname: string) {
    if (!this.parentNode) {
      return;
    }

    const key = Object.keys(this.routes).find((key) => {
      const parts = key.split("/");
      const pathnameParts = pathname.split("/");

      if (parts.length !== pathnameParts.length) {
        return false;
      }

      return parts.every((part, index) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          return true;
        }

        return part === pathnameParts[index];
      });
    });

    const route = key ? this.routes[key] : undefined;

    if (!route || !key) {
      const newNode = document.createTextNode("");
      this.parentNode.replaceChild(newNode, this.node as Node);
      this.node = newNode;
      return;
    }

    let vNode: Mountee;
    if (route instanceof Function) {
      const values = pathname.split("/");
      const keys = key.split("/");
      const urlParams = values.reduce((acc: Params, value, index) => {
        const key = keys[index];
        const name = key.match(/^{{(.*?)}}?/);

        if (name) {
          acc[name[1]] = value;
        }

        return acc;
      }, {});

      vNode = route({
        urlParams,
        searchParams: new URLSearchParams(window.location.search),
      });
    } else {
      vNode = route;
    }

    // TODO: This is repeated from Conditional.
    const newNode = mount(document.createElement("span"), vNode) as Node;
    this.parentNode.replaceChild(newNode, this.node as Node);
    this.node = newNode;
  }
}
