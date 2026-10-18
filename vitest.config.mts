import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    // `server-only` throws outside a React Server Components bundle.
    alias: { "server-only": new URL("./tests/setup/empty.ts", import.meta.url).pathname },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.ts"],
    setupFiles: ["tests/setup/vitest.setup.ts"],
    coverage: { provider: "v8", include: ["lib/**"], reporter: ["text", "html"] },
  },
});
