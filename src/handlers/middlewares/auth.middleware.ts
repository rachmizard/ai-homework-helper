import { getAuth } from "@clerk/tanstack-react-start/server";
import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async (ctx) => {
    const { userId } = await getAuth(getWebRequest()!);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    return ctx.next({
      context: {
        userId,
      },
    });
  }
);

export const serverAuthMiddleware = createMiddleware({
  type: "request",
}).server(async (ctx) => {
  const { userId } = await getAuth(getWebRequest()!);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return ctx.next({
    context: {
      userId,
    },
  });
});
