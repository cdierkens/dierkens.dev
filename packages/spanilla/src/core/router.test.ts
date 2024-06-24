import { describe, expect, it } from "vitest";
import { html, mount } from "./html";
import { Router } from "./router";
import { Signal } from "./signal";

describe("router", () => {
  it("renders a default route", () => {
    const template = html`${Router({
      routes: {
        "/": html`<h1>Home</h1>`,
      },
      pathname: Signal("/"),
    })}`;

    const root = document.createElement("div");

    mount(root, template);

    expect(root.innerHTML).toBe("<h1>Home</h1>");
  });

  it("updates when the pathname changes", () => {
    const pathname = Signal("/");

    const template = html`${Router({
      routes: {
        "/": html`<h1>Home</h1>`,
        "/about": html`<h1>About</h1>`,
      },
      pathname,
    })}`;

    const root = document.createElement("div");

    mount(root, template);

    expect(root.innerHTML).toBe("<h1>Home</h1>");

    pathname.value = "/about";

    expect(root.innerHTML).toBe("<h1>About</h1>");
  });
});
