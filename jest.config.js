module.exports = {
  // transform: {
  //   "^.+\\.[jt]sx?$": "<rootDir>/jest.preprocess.js",
  // },
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/*index*.ts",
  ],
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss)$": `<rootDir>/__mocks__/identity-obj-proxy`,
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": `<rootDir>/__mocks__/file-mock.js`,
  },
  testEnvironment: "jsdom",
  testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
  transformIgnorePatterns: [`node_modules/(?!(gatsby)/)`],
  globals: {
    __PATH_PREFIX__: ``,
  },
  testURL: `http://localhost`,
  setupFiles: [`<rootDir>/jest.loadershim.js`],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom/extend-expect",
    "<rootDir>/jest.matchMedia.js",
    "<rootDir>/jest.immediate.js",
  ],
};
