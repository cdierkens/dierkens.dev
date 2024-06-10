import { Format, defineConfig } from "tsup";
import { umdWrapper } from "esbuild-plugin-umd-wrapper";

export default defineConfig(() => {
  return {
    format: ["esm", "cjs"],
    entryPoints: ["src/spanilla.ts"],
    esbuildPlugins: [umdWrapper()],
    dts: true,
    minify: true,
  };
});
