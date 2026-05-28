import { NextResponse } from "next/server";
import { getPool, hasDatabaseConfig } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({
      ok: false,
      databaseConfigured: false,
      source: "demo"
    });
  }

  try {
    const pool = getPool();
    const [connection, tables, summary] = await Promise.all([
      pool.query("select current_database() as database, current_user as user_name"),
      pool.query(`
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name in (
            'movies_silver',
            'gold_top_movies',
            'gold_avg_rating_by_language',
            'gold_yearly_counts',
            'ml_genre_predictions'
          )
        order by table_name
      `),
      pool.query(`
        select
          (select count(*)::int from movies_silver) as movies_silver_count,
          (select count(*)::int from gold_top_movies) as gold_top_movies_count
      `)
    ]);

    return NextResponse.json({
      ok: true,
      databaseConfigured: true,
      source: "postgres",
      database: connection.rows[0]?.database,
      user: connection.rows[0]?.user_name,
      tables: tables.rows.map((row) => row.table_name),
      counts: summary.rows[0]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "ERR";

    return NextResponse.json(
      {
        ok: false,
        databaseConfigured: true,
        source: "demo",
        error: {
          code,
          message
        }
      },
      { status: 500 }
    );
  }
}
