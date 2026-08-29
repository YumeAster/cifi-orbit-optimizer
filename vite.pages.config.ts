import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // This config is only used to produce the GitHub Pages bundle. The project
  // page is served beneath the repository name, including on local builds.
  base: "/cifi-ultimate-optimizer/",
  plugins: [react()],
  root: "pages",
  build: {
    outDir: "../dist-pages",
    emptyOutDir: true,
  },
});
