import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published: z.coerce.date().optional(),
    updated: z.coerce.date(),
    created: z.coerce.date(),
    hero: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
