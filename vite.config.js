import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import generateRoutes from "./lib/routes.plugin";

export default defineConfig({
  root: "src",
  server: {
    port: 3000,
  },
  build: {
    // Relative to the root
    outDir: "../build",
  },
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
    }),
    generateRoutes(),
  ],
});
