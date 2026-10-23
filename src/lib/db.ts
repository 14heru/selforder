import "server-only";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum dikonfigurasi di .env.local");
}

const globalForPostgres = globalThis as unknown as {
  postgresPool?: Pool;
};

export const db =
  globalForPostgres.postgresPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.postgresPool = db;
}
