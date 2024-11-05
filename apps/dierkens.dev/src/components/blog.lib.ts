import type { CollectionEntry } from "astro:content";

export type Blog = CollectionEntry<"blog">;

export type PublishedBlog = Blog & {
  data: Blog["data"] & Required<Pick<Blog["data"], "published">>;
};

export function isPublishedBlog(blog: Blog, now: Date): blog is PublishedBlog {
  const published = blog.data.published;

  return (
    typeof published !== "undefined" && now.getTime() > published.getTime()
  );
}
