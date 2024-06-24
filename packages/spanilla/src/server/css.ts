import { VStyleSheet, createStyleSheet } from "../core/css";

export function render(vStyleSheet: VStyleSheet) {
  const styleSheet = createStyleSheet(vStyleSheet);

  return Array.from(styleSheet.cssRules)
    .map((rule) => rule.cssText)
    .join(" ");
}
