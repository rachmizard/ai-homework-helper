import { createFileRoute } from "@tanstack/react-router";
import { AuthedHomeworkHelper } from "~/components/authed-homework-helper";
import { GuestHomeworkHelper } from "~/components/guest-homework-helper";
import { fetchClerkAuth } from "~/handlers/auth.handler";

export const Route = createFileRoute("/_guestLayout/")({
  component: HomeworkHelper,
  loader: async () => {
    const user = await fetchClerkAuth();
    return {
      user,
    };
  },
});

function HomeworkHelper() {
  const { user } = Route.useLoaderData();

  const isAuthenticated = !!user?.userId;

  return isAuthenticated ? <AuthedHomeworkHelper /> : <GuestHomeworkHelper />;
}
