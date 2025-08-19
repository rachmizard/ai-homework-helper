/// <reference types="vite/client" />
import { ClerkProvider } from "@clerk/tanstack-react-start";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { DefaultCatchBoundary } from "~/components/default-catch-boundary";
import { NotFound } from "~/components/not-found";
import { QueryProvider } from "~/components/query-provider";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { fetchClerkAuth } from "~/handlers/auth.handler";
import { seo } from "~/handlers/seo";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const { userId } = await fetchClerkAuth();

    return {
      userId,
    };
  },
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
        title: "Hintify | AI Homework Helper",
        description: `Hintify is an AI homework helper that helps you get instant hints, learn concepts, practice problems, and test your knowledge!`,
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
      {
        children: `
          (function() {
            try {
              const storageKey = 'homework-helper-theme';
              const theme = localStorage.getItem(storageKey) || 'dark';
              const root = document.documentElement;
              
              if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
              } else {
                root.classList.add(theme);
              }
            } catch (e) {
              // Fallback to dark theme if there's an error
              document.documentElement.classList.add('dark');
            }
          })();
        `,
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
      <QueryProvider>
        <ThemeProvider defaultTheme="dark" storageKey="homework-helper-theme">
          <html suppressHydrationWarning>
            <head>
              <HeadContent />
            </head>
            <body>
              {children}
              <Toaster />

              <TanStackRouterDevtools position="bottom-right" />
              <Scripts />
            </body>
          </html>
        </ThemeProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
