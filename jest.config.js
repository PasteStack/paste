export default {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js"],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/js/**/*.js"],
  coverageDirectory: "coverage",
  setupFiles: ["<rootDir>/tests/setup-global-paste.js"]
};
