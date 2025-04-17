import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  manifest: {
    name: "iroduku manaba",
    host_permissions: ["https://manaba.tsukuba.ac.jp/*"],
  },
});
