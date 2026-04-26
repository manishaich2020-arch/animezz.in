/**
 * Database client — automatically picks the right driver:
 *   - Local Docker (postgresql://...@localhost/...): uses `pg` (node-postgres)
 *   - NeonDB cloud (neon.tech URL): uses @neondatabase/serverless
 *
 * Returns a real Drizzle instance (no Proxy) so DrizzleAdapter works correctly.
 */
import "server-only"; // Prevents this module from being imported in client components
import * as schema from "./schema";
import { Pool } from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";

const url = process.env.DATABASE_URL ?? "";
const isNeon = url.includes("neon.tech") || url.includes("vercel-storage");

function buildDb() {
  if (isNeon) {
    return drizzleNeon(neon(url), { schema });
  }
  // Local Docker / any standard PostgreSQL
  const pool = new Pool({ connectionString: url });
  return drizzlePg(pool, { schema });
}

// Singleton — created once at module load time
export const db = buildDb();

export type DB = typeof db;
