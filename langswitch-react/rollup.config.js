import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { defineConfig } from "rollup";
import copy from "rollup-plugin-copy";

export default defineConfig({
  input: "src/index.js",
  output: {
    dir: "dist",
    format: "esm",
    name: "npm-react",
  },
  external: ["react", "react-dom"],
  plugins: [
    resolve({
      extensions: [".js", ".jsx"], // Resolve both JS and JSX files
    }),
    commonjs(), // Converts CommonJS modules to ES6
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-react"], // Transpile React JSX
      exclude: "node_modules/**", // Avoid transpiling dependencies
    }),
    copy({
      targets: [{ src: "src/index.d.ts", dest: "dist" }],
    }),
  ],
});
