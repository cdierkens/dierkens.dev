import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      headless: true,
      name: "chrome",
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});
