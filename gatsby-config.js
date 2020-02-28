// https://www.gatsbyjs.org/docs/gatsby-config/

module.exports = {
  siteMetadata: {},
  plugins: [
    {
      resolve: "gatsby-plugin-sass",
      options: {
        postCssPlugins: [require("tailwindcss")]
      }
    },
    "gatsby-plugin-postcss",
    {
      resolve: "gatsby-plugin-purgecss",
      options: {
        printRejected: true,
        tailwind: true
      }
    },
    "gatsby-plugin-typescript",
    {
      resolve: "gatsby-plugin-eslint",
      options: {
        test: /\.ts$|\.tsx$/,
        exclude: /(node_modules|.cache|public)/,
        stages: ["develop", "build-javascript"],
        options: {
          emitWarning: true,
          failOnWarning: true
        }
      }
    },
    "gatsby-plugin-offline"
  ]
};
