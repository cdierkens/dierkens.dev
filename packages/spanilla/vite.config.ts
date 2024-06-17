import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    minify: true,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, "src/spanilla.ts"),
      name: "spanilla",
      fileName: "spanilla",
    },
    rollupOptions: {
      external: ["jsdom"],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
});
