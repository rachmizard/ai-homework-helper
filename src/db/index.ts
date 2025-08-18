// Main database exports
export { db, type DB } from "./connection";

// Schema exports
export * from "./schema/index";

// Re-export Drizzle utilities that might be useful
export { sql } from "drizzle-orm";
