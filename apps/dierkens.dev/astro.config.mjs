// @ts-check
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";
import { remarkReadingTime } from "./astro-plugins/remark-reading-time.mjs";

// https://astro.build/config

export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap(), tailwind()],
  output: "server",
  adapter: cloudflare(),
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});
