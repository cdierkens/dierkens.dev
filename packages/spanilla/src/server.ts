import "global-jsdom/register";

import type { VStyleSheet } from "./core/css";
import { isVStyleSheet } from "./core/css";
import type { Template } from "./core/html";
import { render as renderCSS } from "./server/css";
import { render as renderHTML } from "./server/html";

export function render(value: Template | VStyleSheet): string {
  if (isVStyleSheet(value)) {
    return renderCSS(value);
  } else {
    return renderHTML(value);
  }
}
