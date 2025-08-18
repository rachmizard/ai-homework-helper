import { createFileRoute } from "@tanstack/react-router";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>

      <SignedOut>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>You are not signed in.</p>
          <div className="mt-2">
            <SignInButton mode="modal" />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <UserProfile />
      </SignedIn>
    </div>
  );
}

function UserProfile() {
  const { user } = useUser();

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded">
      <h4 className="text-lg font-semibold">Welcome back!</h4>
      {user && (
        <div className="mt-2">
          <p>Name: {user.fullName || "N/A"}</p>
          <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
          <p>User ID: {user.id}</p>
          <div className="mt-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      )}
    </div>
  );
}
