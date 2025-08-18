import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "@clerk/tanstack-react-start/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { useUser } from "@clerk/tanstack-react-start";

// Server function to check authentication
const authStateFn = createServerFn({ method: "GET" }).handler(async () => {
  const request = getWebRequest();
  if (!request) throw new Error("No request found");

  const { userId } = await getAuth(request);

  if (!userId) {
    throw redirect({
      to: "/sign-in",
    });
  }

  return { userId };
});

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return { userId: context.userId };
  },
});

function Dashboard() {
  const { userId } = Route.useLoaderData();
  const { user } = useUser();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Protected Content</h2>
        <p className="mb-2">
          This page is protected and only accessible to authenticated users.
        </p>
        <div className="mt-4 space-y-2">
          <p>
            <strong>User ID:</strong> {userId}
          </p>
          {user && (
            <>
              <p>
                <strong>Name:</strong> {user.fullName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(user.createdAt!).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
