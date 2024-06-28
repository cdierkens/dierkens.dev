import { Template } from "../spanilla.js";
import { createComponent } from "./component.js";
import { Signal } from "./signal.js";

interface Routes {
  [key: string]:
    | Template
    | ((data: {
        urlParams: Params;
        searchParams: URLSearchParams;
      }) => Template);
}

type Params = Record<string, string>;

// export class Router implements Mountable {
//   public pathname: Signal<string>;
//   private node: Node | undefined;
//   private parentNode: Node | undefined;

//   constructor(private routes: Routes) {
//     pathname = new Signal(window.location.pathname);

//     // Listen for back/forward navigation
//     window.addEventListener("popstate", () => {
//       pathname.value = window.location.pathname;
//     });

//     pathname.subscribe((value) => this.update(value));

//     setTimeout(() => {
//       pathname.value = window.location.pathname;
//     });
//   }

//   // TODO: This could be in an abstract class.
//   mount(element: Node) {
//     this.parentNode = element;
//     this.node = element.appendChild(document.createTextNode(""));

//     this.update(pathname.value);

//     return this.node;
//   }

//   update(pathname: string) {
//     if (!this.parentNode) {
//       return;
//     }

//     const key = Object.keys(this.routes).find((key) => {
//       const parts = key.split("/");
//       const pathnameParts = pathname.split("/");

//       if (parts.length !== pathnameParts.length) {
//         return false;
//       }

//       return parts.every((part, index) => {
//         if (part.startsWith("{{") && part.endsWith("}}")) {
//           return true;
//         }

//         return part === pathnameParts[index];
//       });
//     });

//     const route = key ? this.routes[key] : undefined;

//     if (!route || !key) {
//       const newNode = document.createTextNode("");
//       this.parentNode.replaceChild(newNode, this.node as Node);
//       this.node = newNode;
//       return;
//     }

//     let vNode: VNode | VNode[];
//     if (route instanceof Function) {
//       const values = pathname.split("/");
//       const keys = key.split("/");
//       const urlParams = values.reduce((acc: Params, value, index) => {
//         const key = keys[index];
//         const name = key.match(/^{{(.*?)}}?/);

//         if (name) {
//           acc[name[1]] = value;
//         }

//         return acc;
//       }, {});

//       vNode = route({
//         urlParams,
//         searchParams: new URLSearchParams(window.location.search),
//       });
//     } else {
//       vNode = route;
//     }

//     // TODO: This is repeated from Conditional.
//     const newNode = mount(document.createElement("span"), vNode) as Node;
//     this.parentNode.replaceChild(newNode, this.node as Node);
//     this.node = newNode;
//   }
// }

declare global {
  interface WindowEventMap {
    route: CustomEvent<{ href: string }>;
  }
}

interface RouterProps {
  routes: Routes;
  pathname: Signal<string>;
  fallback?: Template | null;
}

export const Router = createComponent(
  (
    {
      routes,
      pathname = Signal(window.location.pathname),
      fallback = null,
    }: RouterProps,
    onMount,
    onCleanup,
  ) => {
    const onPopState = () => {
      pathname.value = window.location.pathname;
    };

    const onRoute = (event: WindowEventMap["route"]) => {
      const href = event.detail.href;
      pathname.value = href;
    };

    onMount(() => {
      // TODO: Tests to ensure amount of listeners.
      window.addEventListener("popstate", onPopState);

      // TODO: Tests to ensure amount of listeners.
      window.addEventListener("route", onRoute);
    });

    onCleanup(() => {
      console.log("CLEANING UP ROUTER");

      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("route", onRoute);
    });

    const key = Object.keys(routes).find((key) => {
      const parts = key.split("/");
      const pathnameParts = pathname.value.split("/");

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

    if (!key) {
      return fallback;
    }

    const route = routes[key];

    if (typeof route === "function") {
      const values = pathname.value.split("/");
      const keys = key.split("/");
      const urlParams = values.reduce((acc: Params, value, index) => {
        const key = keys[index];
        const name = key.match(/^{{(.*?)}}?/);

        if (name) {
          acc[name[1]] = value;
        }

        return acc;
      }, {});
      return route({
        urlParams,
        searchParams: new URLSearchParams(window.location.search),
      });
    } else {
      return route;
    }
  },
);
