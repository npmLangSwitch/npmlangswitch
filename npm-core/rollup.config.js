import { defineConfig } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import copy from "rollup-plugin-copy";

export default defineConfig({
  input: "src/index.js",
  output: {
    dir: "dist",
    format: "es", // CommonJS format for Node.js
    preserveModules: true, // Preserves your module structure
    exports: "named",
  },
  external: ["fs/promises", "path"],
  plugins: [
    resolve({
      preferBuiltins: true, // Prefer Node.js built-in modules
    }),
    commonjs(), // Convert CommonJS modules to ES6
    json(), // Allow importing JSON files
    terser(), // Minify the output
    copy({
      targets: [{ src: "src/index.d.ts", dest: "dist" }],
    }),
  ],
});
