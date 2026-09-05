import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;

// The Supabase connection string points at the transaction pooler (PgBouncer,
// port 6543), which does not support prepared statements — `prepare: false` is
// required or queries silently degrade. Reuse a single client across dev HMR
// reloads so the pool isn't recreated on every file change.
const globalForDb = globalThis as unknown as {
  __lifeosPgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__lifeosPgClient ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__lifeosPgClient = client;
}

export const db = drizzle(client);
