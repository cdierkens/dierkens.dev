import { VStyleSheet, isVStyleSheet, render as renderCSS } from "./css";
import { Mountee, render as renderHTML } from "./html";
import { installShim } from "./shim";

installShim();

export function render(value: VStyleSheet | Mountee) {
  if (isVStyleSheet(value)) {
    return renderCSS(value);
  } else {
    return renderHTML(value);
  }
}

export { Conditional } from "./conditional";
export { adopt, css } from "./css";
export { html, mount } from "./html";
export { Router } from "./router";
export { Signal } from "./signal";
