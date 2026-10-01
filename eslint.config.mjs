import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored third-party plugin trees that ship with the agent tooling. These
    // are CommonJS and predate the repo, so linting them reported 40
    // no-require-imports errors in files we neither wrote nor build.
    ".agents/**",
  ]),
]);

export default eslintConfig;
