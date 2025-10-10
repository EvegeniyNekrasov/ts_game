import pluginTs from "@typescript-eslint/eslint-plugin";
import parserTs from "@typescript-eslint/parser";
import globals from "globals";

export default [
  { ignores: ["public/**", "node_modules/**"] },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: parserTs,
      sourceType: "module",
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "@typescript-eslint": pluginTs },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "warn",
      "no-undef": "off",
    },
  },
];
