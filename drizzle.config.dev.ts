import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getDatabaseUrlDev } from "~/lib/env-config";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrlDev(),
  },
  verbose: true,
  strict: true,
});
