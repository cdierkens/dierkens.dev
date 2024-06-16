import { describe, expect, it } from "vitest";
import { adopt, css, render } from "./css";
import { installShim } from "./shim";
import { Signal } from "./signal";

installShim();

describe("css", () => {
  describe("css tagged template literal", () => {
    it("parses a simple css rule", () => {
      const vStyle = css`
        h1 {
          color: red;
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "color",
              value: "red",
            },
          ],
        },
      ]);
    });

    it("parses a css rule with multiple properties", () => {
      const vStyle = css`
        h1 {
          color: red;
          font-size: 24px;
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "color",
              value: "red",
            },
            {
              property: "font-size",
              value: "24px",
            },
          ],
        },
      ]);
    });

    it("parses a css rule with a priority", () => {
      const vStyle = css`
        h1 {
          color: red !important;
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "color",
              value: "red",
              priority: "important",
            },
          ],
        },
      ]);
    });

    it("parses a css rule with multiple selectors", () => {
      const vStyle = css`
        h1,
        h2 {
          color: red;
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1, h2",
          declarations: [
            {
              property: "color",
              value: "red",
            },
          ],
        },
      ]);
    });

    it("parses a css rule with multiple rules", () => {
      const vStyle = css`
        h1 {
          color: red;
        }

        h2 {
          color: blue;
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "color",
              value: "red",
            },
          ],
        },
        {
          id: 1,
          selector: "h2",
          declarations: [
            {
              property: "color",
              value: "blue",
            },
          ],
        },
      ]);
    });

    it("parses a css rule with a signal value", () => {
      const signal = new Signal("red");

      const vStyle = css`
        h1 {
          color: ${signal};
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "color",
              value: [signal],
            },
          ],
          signals: [signal],
        },
      ]);
    });

    it("parses a css rule with a signal value and a priority", () => {
      const signal = new Signal("red");

      const vStyle = css`
        h1 {
          color: ${signal} !important;
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "color",
              value: [signal],
              priority: "important",
            },
          ],
          signals: [signal],
        },
      ]);
    });

    it("parses a css rule with a signal value and multiple rules", () => {
      const signal = new Signal("red");

      const vStyle = css`
        h1 {
          color: ${signal};
          font-size: 24px;
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "color",
              value: [signal],
            },
            {
              property: "font-size",
              value: "24px",
            },
          ],
          signals: [signal],
        },
      ]);
    });

    it("parses a css rule with a signal value and multiple selectors", () => {
      const signal = new Signal("red");

      const vStyle = css`
        h1,
        h2 {
          color: ${signal};
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1, h2",
          declarations: [
            {
              property: "color",
              value: [signal],
            },
          ],
          signals: [signal],
        },
      ]);
    });

    it("parses a css rule with multiple signal values", () => {
      const signal1 = new Signal("red");
      const signal2 = new Signal("24px");

      const vStyle = css`
        h1 {
          color: ${signal1};
          font-size: ${signal2};
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "color",
              value: [signal1],
            },
            {
              property: "font-size",
              value: [signal2],
            },
          ],
          signals: [signal1, signal2],
        },
      ]);
    });

    it("parses a css rule with the signal in the middle of a value", () => {
      const signal = new Signal("red");

      const vStyle = css`
        h1 {
          border: 1px solid ${signal};
        }
      `;

      expect(vStyle).toEqual([
        {
          id: 0,
          selector: "h1",
          declarations: [
            {
              property: "border",
              value: ["1px solid", signal],
            },
          ],
          signals: [signal],
        },
      ]);
    });
  });

  describe("adopt", () => {
    it("returns a CSSStyleSheet", () => {
      const rules = css`
        h1 {
          color: red;
        }
      `;

      const styleSheet = adopt(rules);

      expect(styleSheet).toBeInstanceOf(CSSStyleSheet);
      expect(styleSheet.cssRules.length).toBe(1);
      expect(styleSheet.cssRules[0].cssText).toBe("h1 {color: red;}");
    });

    it("returns a CSSStyleSheet with multiple rules", () => {
      const rules = css`
        h1 {
          color: red;
        }

        h2 {
          color: blue;
        }
      `;

      const styleSheet = adopt(rules);

      expect(styleSheet).toBeInstanceOf(CSSStyleSheet);
      expect(styleSheet.cssRules.length).toBe(2);
      expect(styleSheet.cssRules[0].cssText).toBe("h1 {color: red;}");
      expect(styleSheet.cssRules[1].cssText).toBe("h2 {color: blue;}");
    });

    it("updates a signal value", () => {
      const signal = new Signal("red");

      const rules = css`
        h1 {
          color: ${signal};
        }
      `;

      const styleSheet = adopt(rules);

      expect(styleSheet.cssRules[0].cssText).toBe("h1 {color: red;}");

      signal.value = "blue";

      expect(styleSheet.cssRules[0].cssText).toBe("h1 {color: blue;}");
    });
  });

  describe("render", () => {
    it("returns a string", () => {
      const rules = css`
        h1 {
          color: red;
        }
      `;

      const cssText = render(rules);

      expect(cssText).toBe("h1 {color: red;}");
    });

    it("returns a string with multiple rules", () => {
      const rules = css`
        h1 {
          color: red;
        }

        h2 {
          color: blue;
        }
      `;

      const cssText = render(rules);

      expect(cssText).toBe("h1 {color: red;} h2 {color: blue;}");
    });

    it("updates a signal value", () => {
      const signal = new Signal("red");

      const rules = css`
        h1 {
          color: ${signal};
        }
      `;

      const cssText = render(rules);

      expect(cssText).toBe("h1 {color: red;}");
    });
  });
});
