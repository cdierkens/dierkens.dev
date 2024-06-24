import globalJsdom from "global-jsdom";
import { afterEach, beforeEach } from "vitest";

let cleanup: () => void;
beforeEach(async () => {
  cleanup = globalJsdom();
});

afterEach(() => {
  cleanup();
});

if (!globalThis.window) {
  globalJsdom();
}
