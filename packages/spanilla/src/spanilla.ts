import { VStyleSheet, isVStyleSheet, render as renderCSS } from "./css";
import { Component, render as renderHTML } from "./html";

export function render(value: VStyleSheet | Component | Component[]) {
  if (isVStyleSheet(value)) {
    return renderCSS(value);
  } else {
    return renderHTML(value);
  }
}
export { Conditional } from "./conditional";
export { adopt, css } from "./css";
export type { VStyleSheet } from "./css";
export { html, mount } from "./html";
export type { Component, VNode } from "./html";
export { Router } from "./router";
export { installShim } from "./shim";
export { Signal } from "./signal";
