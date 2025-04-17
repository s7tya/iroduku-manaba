import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "iroduku manaba",
    host_permissions: ["https://manaba.tsukuba.ac.jp/*"],
  },
});
