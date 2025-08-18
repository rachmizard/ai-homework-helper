/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import {
  ClerkProvider,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/tanstack-react-start";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/handlers/seo";
import { Toaster } from "~/components/ui/sonner";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      {
        src: "/customScript.js",
        type: "text/javascript",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html>
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="p-2 flex gap-2 text-lg items-center">
            <Link
              to="/"
              activeProps={{
                className: "font-bold",
              }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>{" "}
            <SignedIn>
              <Link
                to="/dashboard"
                activeProps={{
                  className: "font-bold",
                }}
              >
                Dashboard
              </Link>{" "}
            </SignedIn>
            <Link
              // @ts-expect-error
              to="/this-route-does-not-exist"
              activeProps={{
                className: "font-bold",
              }}
            >
              This Route Does Not Exist
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <SignedOut>
                <Link
                  to="/sign-in"
                  activeProps={{
                    className: "font-bold",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  activeProps={{
                    className: "font-bold",
                  }}
                >
                  Sign Up
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
          <hr />
          {children}
          <Toaster />

          <TanStackRouterDevtools position="bottom-right" />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  );
}
