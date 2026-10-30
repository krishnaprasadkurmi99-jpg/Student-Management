import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  preview: {
    realtime: true,
  },
  auth: true,
  functions: {
    hello: {
      name: "Campusly Neon services",
      source: "./hello.ts",
      env: {
        CAMPUSLY_FUNCTION_TOKEN: process.env.CAMPUSLY_FUNCTION_TOKEN!,
        NEON_REALTIME_URL: process.env.NEON_REALTIME_URL!,
        NEON_REALTIME_SECRET: process.env.NEON_REALTIME_SECRET!,
      },
    },
  },
  buckets: {
    // "private" is the default; use "public_read" for anonymous reads
    assets: { access: "private" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
