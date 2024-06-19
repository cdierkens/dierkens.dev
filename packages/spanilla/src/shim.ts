export async function installShim() {
  if (!globalThis.window) {
    const { JSDOM } = await import("jsdom");

    const dom = new JSDOM("");
    globalThis.window = dom.window as typeof globalThis.window;
    globalThis.document = dom.window.document;
    globalThis.Node = dom.window.Node;
    globalThis.CustomEvent = dom.window.CustomEvent;
    globalThis.MutationObserver = dom.window.MutationObserver;
    globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;
  }
}
