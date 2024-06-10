import { Format, defineConfig } from "tsup";
import { umdWrapper } from "esbuild-plugin-umd-wrapper";

export default defineConfig(() => {
  return {
    format: ["esm", "cjs"],
    entryPoints: ["src/spanilla.ts"],
    esbuildPlugins: [umdWrapper()],
    target: ["es6"],
    dts: true,
    minify: true,
  };
});
