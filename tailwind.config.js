const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Source Sans Pro", ...defaultTheme.fontFamily.sans],
        serif: ["Roboto Slab", ...defaultTheme.fontFamily.serif],
        mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  variants: {},
  plugins: [],
};
