module.exports = {
  preset: "jest-preset-angular",
  rootDir: "./src",
  setupFilesAfterEnv: [
    "<rootDir>/../test.ts"
  ],
  testRegex: "\\.(test|spec)\\.(ts|js)x?$",
  transform: {
    "^.+\\.(ts|js|html|svg)$": [
      "jest-preset-angular",
      {
        diagnostics: false,
        tsconfig: "<rootDir>/../tsconfig.spec.json"
      }
    ]
  }
}
