import { VStyleSheet, isVStyleSheet, render as renderCSS } from "./css";
import { Mountee, render as renderHTML } from "./html";

export function render(value: VStyleSheet | Mountee) {
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
export type { Mountee, VNode } from "./html";
export { Router } from "./router";
export { installShim } from "./shim";
export { Signal } from "./signal";
