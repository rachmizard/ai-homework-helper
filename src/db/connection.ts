import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "~/lib/env-config";
import * as schema from "./schema/index";

export const sql = neon(getDatabaseUrl());
export const db = drizzle({ client: sql, schema });

export type DB = typeof db;
