import { getAuth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db, User, users } from "~/db";

export const getUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<User | null> => {
    const { userId } = await getAuth(getWebRequest()!);
    if (!userId) {
      return null;
    }

    const userDb = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return userDb ?? null;
  }
);
