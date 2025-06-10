import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import dns from "dns";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/

//force it to load as localhost not IP
dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  //optimize deps to fix google maps import plugin issue
  optimizeDeps: {
    include: ["@fawmi/vue-google-maps", "fast-deep-equal"],
  },
});
