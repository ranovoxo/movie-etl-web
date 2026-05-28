import { Pool } from "pg";

let pool: Pool | null = null;

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

function connectionStringWithoutSslMode(connectionString: string) {
  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");
  return url.toString();
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    const sslEnabled = process.env.PGSSL !== "false";

    pool = new Pool({
      connectionString: connectionStringWithoutSslMode(process.env.DATABASE_URL),
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000
    });
  }

  return pool;
}
