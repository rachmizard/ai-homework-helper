import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import Aurora from "~/components/backgrounds/Aurora/Aurora";
import { AppSidebar } from "~/components/sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";

const NOT_AUTHENTICATED_ERROR = "not_authenticated";

export const Route = createFileRoute("/_authenticatedLayout")({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw new Error(NOT_AUTHENTICATED_ERROR);
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === NOT_AUTHENTICATED_ERROR) {
      return (
        <div className="flex items-center justify-center p-12 min-h-screen relative overflow-hidden">
          <div className="absolute inset-0">
            <Aurora
              colorStops={["#9333ea", "#ec4899", "#3b82f6"]}
              amplitude={1.5}
              blend={0.8}
              speed={0.5}
            />
          </div>
          <SignIn routing="hash" forceRedirectUrl={window.location.href} />
        </div>
      );
    }

    throw error;
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header with mobile sidebar trigger */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
