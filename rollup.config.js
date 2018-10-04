import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

const tsconfig = process.env.NODE_ENV === "production" ? "tsconfig.json" : "tsconfig.dev.json";
const sourcemap = process.env.NODE_ENV !== "production";
const minimize = process.env.NODE_ENV === "production";

export default [
    {
        input: "src/index.ts",
        output: {
            file: "lib/index.js",
            format: "iife",
            sourcemap,
        },
        plugins: [
            typescript({ tsconfig }),
            resolve({
                browser: true,
                main: false,
            }),
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
    },
    {
        input: "src/sw.ts",
        output: {
            file: "lib/sw.js",
            format: "iife",
            sourcemap: false,
        },
        plugins: [
            typescript({ tsconfig }),
            resolve({
                browser: true,
                main: false,
            }),
            commonjs(),
            replace({
                "CACHE_VERSION": pkg.version,
            }),
        ],
    }
];
