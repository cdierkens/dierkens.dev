import { graphql, PageProps } from "gatsby";
import React from "react";
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
  query IndexPageQuery {
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

const Index: React.FC<PageProps<MDX>> = ({ data: { allMdx } }) => {
  return (
    <Layout>
      <h1>Dierkens Dev</h1>

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
            href={`/blog/${slug}`}
          />
        )
      )}
    </Layout>
  );
};

export default Index;
