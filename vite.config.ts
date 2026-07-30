import { defineConfig } from "vite";

export default defineConfig({
  // Static site serving the root index.html file
  server: {
    host: "localhost",
    port: 8080,
  },
});
