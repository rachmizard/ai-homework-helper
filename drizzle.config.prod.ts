import { defineConfig } from "drizzle-kit";
import { getDatabaseUrlProd } from "~/lib/env-config";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrlProd(),
  },
  verbose: false,
  strict: true,
});
