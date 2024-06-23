import { VStyleSheet, isVStyleSheet, render as renderCSS } from "./lib/css";
import { Component, render as renderHTML } from "./lib/html";

export function render(value: VStyleSheet | Component | Component[]) {
  if (isVStyleSheet(value)) {
    return renderCSS(value);
  } else {
    return renderHTML(value);
  }
}
export { Conditional } from "./lib/conditional";
export { adopt, css } from "./lib/css";
export type { VStyleSheet } from "./lib/css";
export { html, mount } from "./lib/html";
export type { Component, VNode } from "./lib/html";
export { Router } from "./lib/router";
export { installShim } from "./lib/shim";
export { Signal } from "./lib/signal";
