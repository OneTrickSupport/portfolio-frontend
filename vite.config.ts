import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Two pages: the portfolio itself, and the apartment planner that the
      // /planner routes show in an iframe (plain JS + three.js, kept out of the main bundle).
      input: {
        main: path.resolve(__dirname, "index.html"),
        moblera: path.resolve(__dirname, "moblera/index.html"),
      },
    },
  },
  server: {
    port: 5173,
  },
});
