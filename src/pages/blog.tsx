import { graphql, PageProps } from "gatsby";
import React from "react";
import { Title } from "react-head";
import { BlogPreview, Layout } from "../components";

interface Frontmatter {
  author: string;
  avatar: string;
  date: string;
  description: string;
  title: string;
}

interface MDX {
  allMdx: {
    nodes: {
      id: number;
      slug: string;
      frontmatter: Frontmatter;
    }[];
  };
}

export const pageQuery = graphql`
  query BlogPageQuery {
    allMdx(limit: 10) {
      nodes {
        id
        slug
        frontmatter {
          author
          avatar
          date
          description
          title
        }
      }
    }
  }
`;

const BlogPage: React.FC<PageProps<MDX>> = ({ data: { allMdx } }) => {
  return (
    <Layout>
      <Title>Dierkens Dev - Blog</Title>

      <h1>Blogs</h1>

      {allMdx.nodes.map(
        ({
          id,
          slug,
          frontmatter: { title, description, author, date, avatar },
        }) => (
          <BlogPreview
            key={id}
            title={title}
            description={description}
            author={author}
            date={date}
            avatar={avatar}
            href={`/blog/${slug}/`}
          />
        )
      )}
    </Layout>
  );
};

export default BlogPage;
