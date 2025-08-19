import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig, PluginOption } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 600, // Increase limit slightly for better chunking
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({ customViteReactPlugin: true, target: "netlify" }),
    viteReact(),
    tailwindcss() as PluginOption,
  ],
});
