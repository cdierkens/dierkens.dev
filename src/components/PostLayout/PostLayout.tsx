import { MDXProvider } from "@mdx-js/react";
import { formatDistance } from "date-fns";
import { graphql, Link, PageProps } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import React from "react";
import { Meta, Title } from "react-head";
import Layout from "../Layout";

const shortcodes = { Link };

interface Frontmatter {
  title: string;
  author: string;
  date: string;
  description: string;
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
    <>
      <Layout>
        <Title>Dierkens Dev - {mdx.frontmatter.title}</Title>
        <Meta name="description" content={mdx.frontmatter.description} />

        <article>
          <h1>{mdx.frontmatter.title}</h1>
          <p>
            <span>{mdx.frontmatter.author}</span> -{" "}
            <span>
              {formatDistance(new Date(mdx.frontmatter.date), new Date(), {
                addSuffix: true,
              })}
            </span>
          </p>
          <MDXProvider components={shortcodes}>
            <MDXRenderer pageContext={pageContext}>{mdx.body}</MDXRenderer>
          </MDXProvider>
        </article>
      </Layout>
    </>
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
        date
        description
      }
    }
  }
`;

export default PostLayout;
