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

const addTrailingSlash = (path) => (path.endsWith("/") ? path : `${path}/`);

exports.onCreatePage = ({ page, actions }) => {
  const { createRedirect } = actions;

  const path = addTrailingSlash(page.path);

  // Redirect to trailing slash with a 302 to match AWS S3
  if (page.path !== path) {
    createRedirect({
      toPath: path,
      fromPath: page.path,
      isPermanent: false,
      redirectInBrowser: true,
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
