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
import { Navbar } from "~/components/navbar";
import appCss from "~/styles/app.css?url";
import { seo } from "~/handlers/seo";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/components/theme-provider";

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
      <ThemeProvider defaultTheme="system" storageKey="homework-helper-theme">
        <html>
          <head>
            <HeadContent />
          </head>
          <body>
            <Navbar />
            {children}
            <Toaster />

            <TanStackRouterDevtools position="bottom-right" />
            <Scripts />
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
