import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

/** @type {import('@astrojs/markdown-remark').RemarkPlugin} */
export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);

    data.astro.frontmatter.readingTime = readingTime.text;
  };
}
