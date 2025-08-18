import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db, User, users } from "~/db";
import { authMiddleware } from "./middlewares/auth.middleware";

export const getUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<User | null> => {
    if (!context?.userId) {
      throw new Error("Unauthorized");
    }

    const userDb = await db.query.users.findFirst({
      where: eq(users.clerkId, context.userId),
    });

    return userDb ?? null;
  });
