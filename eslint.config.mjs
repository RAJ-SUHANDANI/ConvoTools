import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "public/pdf.worker.mjs",
    "public/workers/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "ui-results/**",
    "matrix-results/**"
  ]),
]);
