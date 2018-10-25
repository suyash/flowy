import commonjs from "rollup-plugin-commonjs";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

const tsconfig = process.env.NODE_ENV === "production" ? "tsconfig.json" : "tsconfig.dev.json";
const sourcemap = process.env.NODE_ENV !== "production";
const minimize = process.env.NODE_ENV === "production";
const sw = process.env.NODE_ENV === "production";

export default [
    {
        input: "src/index.ts",
        output: {
            file: "lib/index.js",
            format: "iife",
            sourcemap,
        },
        plugins: [
            resolve({
                browser: true,
                main: false,
            }),
            commonjs(),
            typescript({ tsconfig, tsconfigOverride: { compilerOptions: { module: "es2015" } } }),
            postcss({
                extract: true,
                minimize,
                sourceMap: sourcemap,
            }),
            !minimize && copy({
                verbose: true,
                "src/index.html": "lib/index.html",
            }),
            replace({
                USE_SERVICE_WORKER: sw,
            }),
            minimize && terser({ sourcemap }),
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
            resolve({
                browser: true,
                main: false,
            }),
            commonjs(),
            typescript({ tsconfig, tsconfigOverride: { compilerOptions: { module: "es2015" } }  }),
            replace({
                CACHE_VERSION: pkg.version,
            }),
            minimize && terser({ sourcemap }),
        ],
    }
];
