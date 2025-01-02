module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    "standard",
    "plugin:jsdoc/recommended",
    "plugin:import/recommended",
    "plugin:promise/recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [ "import", "promise", "jsdoc" ],
  globals: {
    Bot: true,
    redis: true,
    logger: true,
    plugin: true,
    segment: true
  },
  rules: {
    "eqeqeq": [ "off" ],
    "prefer-const": [ "off" ],
    "arrow-body-style": "off",
    "camelcase": "off",
    "quotes": [ "error", "double" ],
    "quote-props": [ "error", "consistent" ],
    "no-eval": [ "error", { allowIndirect: true } ],
    "array-bracket-newline": [ "error", { multiline: true } ],
    "array-bracket-spacing": [ "error", "always" ],
    "space-before-function-paren": [ "error", "never" ],
    "no-invalid-this": "error",
    "jsdoc/require-returns": 0,
    "jsdoc/require-jsdoc": 0,
    "jsdoc/require-param-description": 0,
    "jsdoc/require-returns-description": 0,
    "jsdoc/require-param-type": 0,
    "import/extensions": [ "error", "ignorePackages" ],
    "one-var": [ "off" ]
  },
  settings: {
    "import/resolver": {
      "custom-alias": {
        alias: {
          "#components": "./components/index.js",
          "#model": "./model/index.js"
        },
        extensions: [ ".js", ".json", ".jsx", ".ts", ".tsx" ]
      }
    }
  },
  ignorePatterns: [ "test.js" ]
}
