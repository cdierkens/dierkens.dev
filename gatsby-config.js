// https://www.gatsbyjs.org/docs/gatsby-config/

module.exports = {
  siteMetadata: {},
  plugins: [
    "gatsby-plugin-typescript",
    {
      resolve: "gatsby-plugin-sass",
      options: {
        postCssPlugins: [require("tailwindcss")],
      },
    },
    "gatsby-plugin-postcss",
    {
      resolve: "gatsby-plugin-eslint",
      options: {
        test: /\.ts$|\.tsx$/,
        exclude: /(node_modules|.cache|public)/,
        stages: ["develop", "build-javascript"],
        options: {
          emitWarning: true,
          failOnWarning: true,
        },
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
    "gatsby-plugin-offline",
  ],
};
