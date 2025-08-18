import { getAuth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db, User, users } from "~/db";

export const getUser = createServerFn({ method: "GET" })
  .validator((clerkId?: string) => clerkId ?? null)
  .handler(async ({ data: clerkId }): Promise<User | null> => {
    const { userId } = await getAuth(getWebRequest()!);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const userDb = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId || userId),
    });

    return userDb ?? null;
  });
