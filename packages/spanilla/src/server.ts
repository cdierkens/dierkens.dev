import { JSDOM } from "jsdom";
import { VStyleSheet, isVStyleSheet, render as renderCSS } from "./lib/css";
import { Component, render as renderHTML } from "./lib/html";

const dom = new JSDOM();

for (const key in dom) {
  // @ts-ignore
  globalThis = dom.window[key];
}

export function render(value: VStyleSheet | Component | Component[]) {
  if (isVStyleSheet(value)) {
    return renderCSS(value);
  } else {
    return renderHTML(value);
  }
}
