import { describe, expect, it } from "vitest";
import { Conditional, Router, Signal, html, mount, render } from "./spanilla";

const isJSDOM = window.navigator.userAgent.includes("jsdom");

describe("spanilla", () => {
  it("renders simple a string", () => {
    const root = document.createElement("div");
    const vnode = html`Hello, World!`;

    mount(root, vnode);

    expect(root.innerHTML).toBe("Hello, World!");
  });

  it("renders markup", () => {
    const root = document.createElement("div");
    const vnode = html`
      <h1>Hello, World!</h1>
      <p>This is a paragraph.</p>
    `;

    mount(root, vnode);

    expect(root.innerHTML).toBe(
      "<h1>Hello, World!</h1><p>This is a paragraph.</p>",
    );
  });

  it("renders a signal", () => {
    const root = document.createElement("div");
    const signal = new Signal("Hello, World!");
    const vnode = html`${signal}`;

    mount(root, vnode);

    expect(root.innerHTML).toBe("Hello, World!");

    signal.value = "Goodbye, World!";

    expect(root.innerHTML).toBe("Goodbye, World!");
  });

  it("renders a promise", async () => {
    const root = document.createElement("div");
    const promise = Promise.resolve("Hello, World!");
    const vnode = html`${promise}`;

    mount(root, vnode);

    expect(root.innerHTML).toBe("");

    await promise;

    expect(root.innerHTML).toBe("Hello, World!");
  });

  it("renders a signal in an attribute", () => {
    const root = document.createElement("div");

    const signal = new Signal("Hello, World!");
    const vnode = html`<span title=${signal}></span>`;

    mount(root, vnode);

    expect(root.innerHTML).toBe('<span title="Hello, World!"></span>');

    signal.value = "Goodbye, World!";

    expect(root.innerHTML).toBe('<span title="Goodbye, World!"></span>');
  });

  it.skipIf(isJSDOM)("hijacks the anchor elements", () => {
    const root = document.createElement("div");
    const vnode = html`<a href="/about">About</a>`;

    mount(root, vnode);

    expect(root.innerHTML).toBe('<a href="/about">About</a>');

    root.querySelector("a")?.click();

    root.addEventListener("route", (event) => {
      expect((event as CustomEvent<{ href: string }>).detail.href).toBe(
        "/about",
      );
    });
  });

  it.skipIf(isJSDOM)("does not hijack remote anchar elements", () => {
    const root = document.createElement("div");
    const vnode = html`<a href="https://example.com">Example</a>`;

    mount(root, vnode);

    expect(root.innerHTML).toBe('<a href="https://example.com">Example</a>');

    root.querySelector("a")?.click();

    root.addEventListener("route", () => {
      throw new Error("This should not be called.");
    });
  });

  it("renders nested html templates", () => {
    const root = document.createElement("div");
    const vnode = html`
      <h1>Hello, World!</h1>
      ${html`<p>This is a paragraph.</p>`}
    `;

    mount(root, vnode);

    expect(root.innerHTML).toBe(
      "<h1>Hello, World!</h1><p>This is a paragraph.</p>",
    );
  });

  it("renders a Conditional element", () => {
    const root = document.createElement("div");
    const show = new Signal(true);
    const vnode = html`
      ${new Conditional(show, (show) => show, html`Hello, World!`)}
    `;

    mount(root, vnode);

    expect(root.innerHTML).toBe("Hello, World!");

    show.value = false;

    expect(root.innerHTML).toBe("");

    show.value = true;

    expect(root.innerHTML).toBe("Hello, World!");
  });

  it.skipIf(isJSDOM)("renders a Router element", () => {
    const root = document.createElement("div");
    const vnode = html`
      ${new Router({
        "/": html`<h1>Home</h1>`,
        "/about": html`<h1>About</h1>`,
      })}

      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/content">Content</a>
    `;

    mount(root, vnode);

    (root.querySelector("a[href='/']") as HTMLAnchorElement)?.click();
    expect(root.innerHTML).toBe(
      '<h1>Home</h1><a href="/">Home</a><a href="/about">About</a><a href="/content">Content</a>',
    );

    (root.querySelector("a[href='/about']") as HTMLAnchorElement)?.click();
    expect(root.innerHTML).toBe(
      '<h1>About</h1><a href="/">Home</a><a href="/about">About</a><a href="/content">Content</a>',
    );

    (root.querySelector("a[href='/content']") as HTMLAnchorElement)?.click();
    expect(root.innerHTML).toBe(
      '<a href="/">Home</a><a href="/about">About</a><a href="/content">Content</a>',
    );
  });

  it("renders html", () => {
    expect(render(html`Hello, World!`)).toBe("Hello, World!");

    expect(render(html`<h1>Hello, World!</h1>`)).toBe("<h1>Hello, World!</h1>");

    const signal = Signal("Hello, World!");
    expect(render(html`${signal}`)).toBe("Hello, World!");

    const vnode = html`<span title=${signal}></span>`;
    expect(render(vnode)).toBe('<span title="Hello, World!"></span>');

    const show = new Signal(true);
    const conditional = new Conditional(
      show,
      (show) => show,
      html`Hello, World!`,
    );
    expect(render(html`${conditional}`)).toBe("Hello, World!");
  });
});
