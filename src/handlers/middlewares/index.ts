import { registerGlobalMiddleware } from "@tanstack/react-start";
import { authMiddleware } from "./auth.middleware";
import { logMiddleware } from "./logging.middleware";

registerGlobalMiddleware({
  middleware: [authMiddleware, logMiddleware],
});
