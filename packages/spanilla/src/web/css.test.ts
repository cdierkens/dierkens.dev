import { describe, expect, it } from "vitest";
import { css } from "../core/css";
import { Signal } from "../core/signal";
import { adopt } from "./css";

describe("adopt", () => {
  it("returns a CSSStyleSheet", () => {
    const vStylesheet = css`
      h1 {
        color: red;
      }
    `;

    const styleSheet = adopt(vStylesheet);

    expect(styleSheet).toBeInstanceOf(CSSStyleSheet);
    expect(styleSheet.cssRules.length).toBe(1);
    expect(styleSheet.cssRules[0].cssText).toBe(
      `.${vStylesheet.class} h1 { color: red; }`,
    );
  });

  it("returns a CSSStyleSheet with multiple rules", () => {
    const vStyleSheet = css`
      h1 {
        color: red;
      }

      h2 {
        color: blue;
      }
    `;

    const styleSheet = adopt(vStyleSheet);

    expect(styleSheet).toBeInstanceOf(CSSStyleSheet);
    expect(styleSheet.cssRules.length).toBe(2);
    expect(styleSheet.cssRules[0].cssText).toBe(
      `.${vStyleSheet.class} h1 { color: red; }`,
    );
    expect(styleSheet.cssRules[1].cssText).toBe(
      `.${vStyleSheet.class} h2 { color: blue; }`,
    );
  });

  it("updates a signal value", () => {
    const signal = Signal("red");

    const vStyleSheet = css`
      h1 {
        color: ${signal};
      }
    `;

    const styleSheet = adopt(vStyleSheet);

    expect(styleSheet.cssRules[0].cssText).toBe(
      `.${vStyleSheet.class} h1 { color: red; }`,
    );

    signal.value = "blue";

    expect(styleSheet.cssRules[0].cssText).toBe(
      `.${vStyleSheet.class} h1 { color: blue; }`,
    );
  });
});
