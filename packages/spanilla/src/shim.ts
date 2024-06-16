export function installShim() {
  if (!globalThis.window) {
    const { JSDOM } = require("jsdom");

    const dom = new JSDOM("");
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.Node = dom.window.Node;
    globalThis.CustomEvent = dom.window.CustomEvent;
    globalThis.MutationObserver = dom.window.MutationObserver;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;
  }
}
