import type { QueryResultRow } from "pg";
import { getPool, hasDatabaseConfig } from "./db";
import {
  genrePredictions as sampleGenrePredictions,
  ratingsByLanguage as sampleRatingsByLanguage,
  summary as sampleSummary,
  topMovies as sampleTopMovies,
  yearlyCounts as sampleYearlyCounts
} from "./sample-data";
import type {
  DashboardPayload,
  GenrePrediction,
  RatingByLanguage,
  ReportSummary,
  TopMovie,
  YearlyCount
} from "./types";

const TOP_MOVIES_QUERY = `
  select
    title,
    release_year,
    vote_average,
    vote_count,
    weighted_score,
    original_language
  from gold_top_movies
  order by weighted_score desc nulls last
  limit 12
`;

const RATINGS_BY_LANGUAGE_QUERY = `
  select
    original_language,
    avg_rating,
    movie_count
  from gold_avg_rating_by_language
  order by avg_rating desc nulls last
  limit 12
`;

const YEARLY_COUNTS_QUERY = `
  select
    release_year,
    movie_count
  from gold_yearly_counts
  where release_year is not null
  order by release_year asc
`;

const GENRE_PREDICTIONS_QUERY = `
  select
    movie_id,
    title,
    actual_genre,
    predicted_genre,
    confidence
  from ml_genre_predictions
  order by movie_id desc nulls last
  limit 50
`;

const SUMMARY_QUERY = `
  with movie_stats as (
    select
      count(*)::int as total_movies,
      count(distinct original_language)::int as total_languages,
      max(release_year)::int as latest_release_year
    from movies_silver
  ),
  top_movie as (
    select title, weighted_score
    from gold_top_movies
    order by weighted_score desc nulls last
    limit 1
  ),
  predictions as (
    select
      case
        when count(*) = 0 then null
        else avg((actual_genre = predicted_genre)::int)::float
      end as prediction_accuracy
    from ml_genre_predictions
  )
  select
    movie_stats.total_movies,
    movie_stats.total_languages,
    movie_stats.latest_release_year,
    top_movie.title as top_movie,
    top_movie.weighted_score as top_weighted_score,
    predictions.prediction_accuracy
  from movie_stats
  cross join top_movie
  cross join predictions
`;

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function integerValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

async function queryRows<T extends QueryResultRow>(sql: string) {
  const result = await getPool().query<T>(sql);
  return result.rows;
}

async function fromDatabase<T>(query: () => Promise<T>, fallback: T) {
  if (!hasDatabaseConfig()) {
    return fallback;
  }

  try {
    return await query();
  } catch (error) {
    console.error("Report query failed, returning demo data", error);
    return fallback;
  }
}

export async function getTopMovies(): Promise<TopMovie[]> {
  return fromDatabase(async () => {
    const rows = await queryRows<Record<string, unknown>>(TOP_MOVIES_QUERY);

    return rows.map((row) => ({
      title: String(row.title ?? "Untitled"),
      release_year: integerValue(row.release_year),
      vote_average: numberValue(row.vote_average),
      vote_count: numberValue(row.vote_count),
      weighted_score: numberValue(row.weighted_score),
      original_language: row.original_language ? String(row.original_language) : null
    }));
  }, sampleTopMovies);
}

export async function getRatingsByLanguage(): Promise<RatingByLanguage[]> {
  return fromDatabase(async () => {
    const rows = await queryRows<Record<string, unknown>>(RATINGS_BY_LANGUAGE_QUERY);

    return rows.map((row) => ({
      original_language: String(row.original_language ?? "unknown"),
      avg_rating: numberValue(row.avg_rating),
      movie_count: numberValue(row.movie_count)
    }));
  }, sampleRatingsByLanguage);
}

export async function getYearlyCounts(): Promise<YearlyCount[]> {
  return fromDatabase(async () => {
    const rows = await queryRows<Record<string, unknown>>(YEARLY_COUNTS_QUERY);

    return rows.map((row) => ({
      release_year: numberValue(row.release_year),
      movie_count: numberValue(row.movie_count)
    }));
  }, sampleYearlyCounts);
}

export async function getGenrePredictions(): Promise<GenrePrediction[]> {
  return fromDatabase(async () => {
    const rows = await queryRows<Record<string, unknown>>(GENRE_PREDICTIONS_QUERY);

    return rows.map((row) => ({
      movie_id: integerValue(row.movie_id),
      title: String(row.title ?? "Untitled"),
      actual_genre: row.actual_genre ? String(row.actual_genre) : null,
      predicted_genre: row.predicted_genre ? String(row.predicted_genre) : null,
      confidence: row.confidence == null ? null : numberValue(row.confidence)
    }));
  }, sampleGenrePredictions);
}

export async function getSummary(): Promise<ReportSummary> {
  return fromDatabase(async () => {
    const rows = await queryRows<Record<string, unknown>>(SUMMARY_QUERY);
    const row = rows[0] ?? {};

    return {
      total_movies: numberValue(row.total_movies),
      total_languages: numberValue(row.total_languages),
      latest_release_year: integerValue(row.latest_release_year),
      top_movie: String(row.top_movie ?? "Unavailable"),
      top_weighted_score: numberValue(row.top_weighted_score),
      prediction_accuracy: row.prediction_accuracy == null ? null : numberValue(row.prediction_accuracy),
      latest_etl_run: null,
      source: "postgres"
    };
  }, sampleSummary);
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const [summary, topMovies, ratingsByLanguage, yearlyCounts, genrePredictions] = await Promise.all([
    getSummary(),
    getTopMovies(),
    getRatingsByLanguage(),
    getYearlyCounts(),
    getGenrePredictions()
  ]);

  return {
    summary,
    topMovies,
    ratingsByLanguage,
    yearlyCounts,
    genrePredictions
  };
}
