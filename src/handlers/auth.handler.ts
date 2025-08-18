import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./middlewares/auth.middleware";

export const fetchClerkAuth = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return {
      userId: context.userId ?? null,
    };
  });
