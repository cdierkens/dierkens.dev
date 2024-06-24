import { describe, expect, it } from "vitest";
import { css } from "./css";
import { Signal } from "./signal";

describe("css", () => {
  describe("css tagged template literal", () => {
    it("parses a simple css rule", () => {
      const vStyle = css`
        h1 {
          color: red;
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
            declarations: [
              {
                property: "color",
                value: "red",
              },
            ],
          },
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with multiple properties", () => {
      const vStyle = css`
        h1 {
          color: red;
          font-size: 24px;
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
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
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with a priority", () => {
      const vStyle = css`
        h1 {
          color: red !important;
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
            declarations: [
              {
                property: "color",
                value: "red",
                priority: "important",
              },
            ],
          },
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with multiple selectors", () => {
      const vStyle = css`
        h1,
        h2 {
          color: red;
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1, .${vStyle.class} h2`,
            declarations: [
              {
                property: "color",
                value: "red",
              },
            ],
          },
        ],
        [Symbol.for("VStylesheet")]: true,
      });
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

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
            declarations: [
              {
                property: "color",
                value: "red",
              },
            ],
          },
          {
            id: 1,
            selector: `.${vStyle.class} h2`,
            declarations: [
              {
                property: "color",
                value: "blue",
              },
            ],
          },
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with a signal value", () => {
      const signal = Signal("red");

      const vStyle = css`
        h1 {
          color: ${signal};
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
            declarations: [
              {
                property: "color",
                value: [signal],
              },
            ],
            signals: [signal],
          },
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with a signal value and a priority", () => {
      const signal = Signal("red");

      const vStyle = css`
        h1 {
          color: ${signal} !important;
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
            declarations: [
              {
                property: "color",
                value: [signal],
                priority: "important",
              },
            ],
            signals: [signal],
          },
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with a signal value and multiple rules", () => {
      const signal = Signal("red");

      const vStyle = css`
        h1 {
          color: ${signal};
          font-size: 24px;
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
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
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with a signal value and multiple selectors", () => {
      const signal = Signal("red");

      const vStyle = css`
        h1,
        h2 {
          color: ${signal};
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1, .${vStyle.class} h2`,
            declarations: [
              {
                property: "color",
                value: [signal],
              },
            ],
            signals: [signal],
          },
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with multiple signal values", () => {
      const signal1 = Signal("red");
      const signal2 = Signal("24px");

      const vStyle = css`
        h1 {
          color: ${signal1};
          font-size: ${signal2};
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
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
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });

    it("parses a css rule with the signal in the middle of a value", () => {
      const signal = Signal("red");

      const vStyle = css`
        h1 {
          border: 1px solid ${signal};
        }
      `;

      expect(vStyle).toEqual({
        class: expect.any(String),
        rules: [
          {
            id: 0,
            selector: `.${vStyle.class} h1`,
            declarations: [
              {
                property: "border",
                value: ["1px solid", signal],
              },
            ],
            signals: [signal],
          },
        ],
        [Symbol.for("VStylesheet")]: true,
      });
    });
  });
});
