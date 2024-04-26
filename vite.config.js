import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src",
  server: {
    port: 3000,
  },
  build: {
    // Relative to the root
    outDir: "../dist",
  },
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
    }),
  ],
});
