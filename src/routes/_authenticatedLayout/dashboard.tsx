import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticatedLayout/dashboard")({
  component: Dashboard,
});

function Dashboard() {
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
            <strong>User ID:</strong> {user?.id}
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
