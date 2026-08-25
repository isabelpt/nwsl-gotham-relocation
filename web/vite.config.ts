import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base -- this app is embedded as a static subpath (site/public/map/) inside the
  // main site, not served from a domain root, so asset URLs can't be hardcoded to "/".
  base: "./",
});
