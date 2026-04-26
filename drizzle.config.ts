import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local so drizzle-kit can read DATABASE_URL
config({ path: ".env.local" });

const url = process.env.DATABASE_URL ?? "";
// NeonDB needs the neon driver; local Docker uses standard pg
const isNeon = url.includes("neon.tech") || url.includes("vercel-storage");

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  // Use standard pg for local Docker; neon driver auto-detected for cloud
  ...(isNeon ? {} : {}),
} satisfies Config;
