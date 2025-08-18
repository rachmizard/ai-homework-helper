import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.development",
});

// Define the environment schema with Zod validation
const envSchema = z.object({
  // Clerk Authentication
  VITE_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "VITE_CLERK_PUBLISHABLE_KEY is required")
    .startsWith("pk_", 'VITE_CLERK_PUBLISHABLE_KEY must start with "pk_"'),

  CLERK_SECRET_KEY: z
    .string()
    .min(1, "CLERK_SECRET_KEY is required")
    .startsWith("sk_", 'CLERK_SECRET_KEY must start with "sk_"'),

  CLERK_WEBHOOK_SECRET: z
    .string()
    .min(1, "CLERK_WEBHOOK_SECRET is required")
    .startsWith("whsec_", 'CLERK_WEBHOOK_SECRET must start with "whsec_"'),

  // Database Configuration
  DATABASE_URL_PROD: z
    .string()
    .min(1, "DATABASE_URL_PROD is required")
    .url("DATABASE_URL_PROD must be a valid URL")
    .startsWith(
      "postgresql://",
      "DATABASE_URL_PROD must be a PostgreSQL connection string"
    ),

  DATABASE_URL_DEV: z
    .string()
    .min(1, "DATABASE_URL_DEV is required")
    .url("DATABASE_URL_DEV must be a valid URL")
    .startsWith(
      "postgresql://",
      "DATABASE_URL_DEV must be a PostgreSQL connection string"
    )
    .optional(),

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"], {
      errorMap: () => ({
        message: 'NODE_ENV must be "development", "production", or "test"',
      }),
    })
    .default("development"),
});

// Create a function to validate and parse environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  • ${err.path.join(".")}: ${err.message}`);
      });

      // In development, show helpful error message
      if (process.env.NODE_ENV === "development") {
        console.error(
          "\n💡 Make sure you have a .env file with all required variables."
        );
        console.error("   Check env.example for reference.");
      }

      process.exit(1);
    }
    throw error;
  }
}

// Export the validated environment configuration
export const env = validateEnv();

// Export the type for TypeScript usage
export type Env = z.infer<typeof envSchema>;

// Helper function to check if we're in development
export const isDev = env.NODE_ENV === "development";

// Helper function to check if we're in production
export const isProd = env.NODE_ENV === "production";

// Helper function to check if we're in test
export const isTest = env.NODE_ENV === "test";

// Helper function to get the appropriate database URL based on environment
export const getDatabaseUrlDev = () => {
  if (isDev && env.DATABASE_URL_DEV) {
    return env.DATABASE_URL_DEV;
  }
  throw new Error("DATABASE_URL_DEV is not set in production");
};

export const getDatabaseUrlProd = () => {
  if (isProd && env.DATABASE_URL_PROD) {
    return env.DATABASE_URL_PROD;
  }
  throw new Error("DATABASE_URL_PROD is not set in development");
};

export const getDatabaseUrl = () => {
  if (isDev) {
    return getDatabaseUrlDev();
  }
  return getDatabaseUrlProd();
};
