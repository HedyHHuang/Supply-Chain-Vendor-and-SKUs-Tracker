import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**"],
  },

  js.configs.recommended,

  {
    files: ["server.js", "routes/**/*.js", "db/**/*.js"],

    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ["public/js/**/*.js"],

    languageOptions: {
      globals: globals.browser,
    },
  },
];
