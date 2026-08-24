import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // The repository is intentionally named cifi-orbit-optimizer so this is the
  // exact production path used by GitHub Pages; local previews stay at root.
  base: process.env.GITHUB_ACTIONS === "true" ? "/cifi-orbit-optimizer/" : "/",
  plugins: [react()],
  root: "pages",
  build: {
    outDir: "../dist-pages",
    emptyOutDir: true,
  },
});
