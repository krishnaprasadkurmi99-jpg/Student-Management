import { createRealtime, rawSql } from "@neon/realtime/server";
import { attachDatabasePool } from "@neon/functions";
import { Hono } from "hono";
import { Pool } from "pg";

const requiredEnvironment = [
  "DATABASE_URL",
  "NEON_REALTIME_URL",
  "NEON_REALTIME_SECRET",
  "CAMPUSLY_FUNCTION_TOKEN",
] as const;
for (const name of requiredEnvironment) {
  if (!process.env[name]) {
    throw new Error(`${name} is required for the Campusly Neon Function.`);
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);
const realtime = createRealtime({
  url: process.env.NEON_REALTIME_URL!,
  secret: process.env.NEON_REALTIME_SECRET!,
  db: "neondb",
});

const app = new Hono();

app.get("/", async (context) => {
  const result = await pool.query("SELECT 1::integer AS connected");
  if (result.rows[0]?.connected !== 1) {
    throw new Error("Neon Postgres connectivity check returned an unexpected result.");
  }
  return context.json({ status: "ok" });
});

app.post("/live-query", async (context) => {
  if (context.req.header("authorization") !== `Bearer ${process.env.CAMPUSLY_FUNCTION_TOKEN}`) {
    return context.json({ error: "Unauthorized" }, 401);
  }
  const sealedQuery = await realtime.seal({
    query: rawSql<{ total: number }>("SELECT COUNT(*)::integer AS total FROM public.student"),
  });
  return context.json({ sealedQuery });
});

export default app;
