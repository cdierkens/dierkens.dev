import type { VStyleSheet } from "../core/css";
import { createStyleSheet } from "../core/css";

export function adopt(vStyleSheet: VStyleSheet) {
  const styleSheet = createStyleSheet(vStyleSheet);

  document.adoptedStyleSheets = document.adoptedStyleSheets
    ? [...document.adoptedStyleSheets, styleSheet]
    : [styleSheet];

  return styleSheet;
}
