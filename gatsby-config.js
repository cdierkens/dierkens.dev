// https://www.gatsbyjs.org/docs/gatsby-config/

module.exports = {
  siteMetadata: {},
  plugins: [
    "gatsby-plugin-typescript",
    "gatsby-plugin-postcss",
    {
      resolve: "gatsby-plugin-eslint",
      options: {
        extensions: ["ts", "tsx"],
        exclude: ["node_modules", ".cache", "public"],
        stages: ["develop", "build-javascript"],
        failOnWarning: true,
        emitWarning: true,
      },
    },
    {
      resolve: "gatsby-plugin-webfonts",
      options: {
        fonts: {
          google: [
            {
              family: "Roboto Mono",
            },
            {
              family: "Source Sans Pro",
              variants: ["400", "400i", "600", "600i", "700", "700i"],
            },
            {
              family: "Roboto Slab",
              variants: ["400", "400i", "600", "600i", "700", "700i"],
            },
          ],
        },
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-prismjs`,
          },
        ],
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: `${__dirname}/src/posts/`,
      },
    },
    "gatsby-plugin-react-head",
    "gatsby-plugin-offline",
    "gatsby-plugin-client-side-redirect",
  ],
};
