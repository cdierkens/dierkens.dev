import { VStyleSheet, isVStyleSheet, render as renderCSS } from "./lib/css";
import { Component, render as renderHTML } from "./lib/html";

export function render(value: VStyleSheet | Component | Component[]) {
  if (isVStyleSheet(value)) {
    return renderCSS(value);
  } else {
    return renderHTML(value);
  }
}
