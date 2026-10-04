import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const workspaceRoot = resolve(__dirname, "../..");
const turbopackRoot = existsSync(resolve(workspaceRoot, "packages", "shared")) ? workspaceRoot : __dirname;
const config: NextConfig = {
  poweredByHeader: false,
  // In this workspace shared data is one level above apps/. The published web
  // repository also works by itself, where its local directory is the root.
  turbopack: { root: turbopackRoot },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ] }];
  },
};
export default config;
