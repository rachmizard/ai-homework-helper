import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "~/components/navbar";

export const Route = createFileRoute("/_guestLayout")({
  component: GuestLayout,
});

function GuestLayout() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
}
