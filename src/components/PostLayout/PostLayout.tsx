import { MDXProvider } from "@mdx-js/react";
import { graphql, Link, PageProps } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import React from "react";
import Layout from "../Layout";

const shortcodes = { Link };

interface Frontmatter {
  title: string;
  author: string;
}

interface MDX {
  mdx: {
    id: number;
    body: string;
    frontmatter: Frontmatter;
  };
}

interface PageContext {
  frontmatter: Frontmatter;
}

const PostLayout: React.FC<PageProps<MDX, PageContext>> = ({
  data: { mdx },
  pageContext,
}) => {
  pageContext.frontmatter = mdx.frontmatter;

  return (
    <Layout>
      <article>
        <h1>
          {mdx.frontmatter.title} - {mdx.frontmatter.author}
        </h1>
        <MDXProvider components={shortcodes}>
          <MDXRenderer pageContext={pageContext}>{mdx.body}</MDXRenderer>
        </MDXProvider>
      </article>
    </Layout>
  );
};

export const pageQuery = graphql`
  query BlogPostQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
        author
      }
    }
  }
`;

export default PostLayout;
