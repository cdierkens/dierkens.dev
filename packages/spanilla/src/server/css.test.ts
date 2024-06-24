import { describe, expect, it } from "vitest";

import { css } from "../core/css";
import { Signal } from "../core/signal";
import { render } from "./css";

describe("render", () => {
  it("returns a string", () => {
    const vStyleSheet = css`
      h1 {
        color: red;
      }
    `;

    const cssText = render(vStyleSheet);

    expect(cssText).toBe(`.${vStyleSheet.class} h1 { color: red; }`);
  });

  it("returns a string with multiple rules", () => {
    const vStyleSheet = css`
      h1 {
        color: red;
      }

      h2 {
        color: blue;
      }
    `;

    const cssText = render(vStyleSheet);

    expect(cssText).toBe(
      `.${vStyleSheet.class} h1 { color: red; } .${vStyleSheet.class} h2 { color: blue; }`,
    );
  });

  it("updates a signal value", () => {
    const signal = Signal("red");

    const vStyleSheet = css`
      h1 {
        color: ${signal};
      }
    `;

    const cssText = render(vStyleSheet);

    expect(cssText).toBe(`.${vStyleSheet.class} h1 { color: red; }`);
  });

  it("renders & styles", () => {
    const vStyleSheet = css`
      &:hover {
        color: red;
      }

      & {
        color: blue;
      }
    `;

    const cssText = render(vStyleSheet);

    expect(cssText).toBe(
      `.${vStyleSheet.class}:hover { color: red; } .${vStyleSheet.class} { color: blue; }`,
    );
  });
});
