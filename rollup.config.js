import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

const tsconfig = process.env.NODE_ENV === "production" ? "tsconfig.json" : "tsconfig.dev.json";
const sourcemap = process.env.NODE_ENV !== "production";
const minimize = process.env.NODE_ENV === "production";

export default {
    input: "src/main.ts",
    output: {
        file: "lib/main.js",
        format: "iife",
        sourcemap,
    },
    plugins: [
        typescript({ tsconfig }),
        resolve({ browser: true }),
        commonjs(),
        postcss({
            extract: true,
            minimize,
            sourceMap: sourcemap,
        }),
        copy({
            verbose: true,
            "src/index.html": "lib/index.html",
        }),
    ],
}
