const { createFilePath } = require(`gatsby-source-filesystem`);
const path = require("path");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === "Mdx") {
    const value = createFilePath({ node, getNode });

    createNodeField({
      name: "slug",
      node,
      value: `/blog${value}`,
    });
  }
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;
  const result = await graphql(`
    query {
      allMdx {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query');
  }

  result.data.allMdx.edges.forEach(({ node }) => {
    createPage({
      // or `node.frontmatter.slug`
      path: node.fields.slug,
      component: path.join(
        __dirname,
        "src/components/PostLayout/PostLayout.tsx"
      ),
      context: { id: node.id },
    });
  });
};

const replacePath = (path) =>
  path === `/` ? path : path.replace(/\/$/, ``).toLowerCase();

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage, createRedirect } = actions;

  const path = replacePath(page.path);

  if (page.path !== path) {
    createRedirect({
      fromPath: page.path,
      toPath: path,
      isPermanent: true,
      redirectInBrowser: true,
    });

    deletePage(page);
    createPage({
      ...page,
      ...{
        path,
      },
    });
  }
};

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  if (stage.startsWith("develop")) {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          "react-dom": "@hot-loader/react-dom",
        },
      },
    });
  }
};
