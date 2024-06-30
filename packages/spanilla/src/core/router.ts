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

declare global {
  interface EventTarget {
    addEventListener(
      type: "route",
      callback: (evt: CustomEvent<{ href: string }>) => void | null,
      options?: AddEventListenerOptions | boolean,
    ): void;

    dispatchEvent(event: CustomEvent<{ href: string }>): boolean;

    removeEventListener(
      type: "route",
      callback: (evt: CustomEvent<{ href: string }>) => void | null,
      options?: EventListenerOptions | boolean,
    ): void;
  }
}

interface RouterProps {
  routes: Routes;
  pathname?: Signal<string>;
  fallback?: Template | null;
}

export const Router = createComponent(
  ({ routes, pathname, fallback }: RouterProps, onMount, onCleanup, root) => {
    // TODO: Invariants. These are optional in the runtime, but required in the
    // initialProps.
    if (!pathname) {
      throw new Error("pathname is required");
    }

    if (!fallback && fallback !== null) {
      throw new Error("fallback is required");
    }

    const onPopState = () => {
      pathname.value = window.location.pathname;
    };

    const onRoute = (event: CustomEvent<{ href: string }>) => {
      const href = event.detail.href;
      pathname.value = href;
    };

    onMount(() => {
      // TODO: Tests to ensure amount of listeners.
      window.addEventListener("popstate", onPopState);

      // TODO: Tests to ensure amount of listeners.
      root.addEventListener("route", onRoute);
    });

    onCleanup(() => {
      window.removeEventListener("popstate", onPopState);
      root.removeEventListener("route", onRoute);
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
  {
    initialProps: {
      pathname: Signal(window.location.pathname),
      fallback: null,
    },
  },
);
