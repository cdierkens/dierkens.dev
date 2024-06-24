import { describe } from "node:test";
import { expect, it } from "vitest";
import { html, mount } from "./html";

describe("html", () => {
  it("does not render undefined", () => {
    const root = document.createElement("div");
    const vNode = html`${undefined}`;

    mount(root, vNode);

    expect(root.innerHTML).toBe("");
  });

  it("does not render null", () => {
    const root = document.createElement("div");
    const vNode = html`${null}`;

    mount(root, vNode);

    expect(root.innerHTML).toBe("");
  });
});
