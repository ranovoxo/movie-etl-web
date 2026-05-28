"use client";

import { BarChart3, BrainCircuit, CalendarDays, Database, Film, Languages, RefreshCw, ServerCog, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DashboardPayload, GenrePrediction, RatingByLanguage, ReportSummary, TopMovie, YearlyCount } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

async function fetchJson<T>(path: string): Promise<T> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_REPORTS_API_URL?.replace(/\/$/, "");
  const response = await fetch(`${apiBaseUrl ?? ""}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return response.json() as Promise<T>;
}

function initialPayload(): DashboardPayload {
  return {
    summary: {
      total_movies: 0,
      total_languages: 0,
      latest_release_year: null,
      top_movie: "Loading",
      top_weighted_score: 0,
      prediction_accuracy: null,
      latest_etl_run: null,
      source: "demo"
    },
    topMovies: [],
    ratingsByLanguage: [],
    yearlyCounts: [],
    genrePredictions: []
  };
}

export function Dashboard() {
  const [payload, setPayload] = useState<DashboardPayload>(initialPayload);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReports() {
    setLoading(true);
    setError(null);

    try {
      const [summary, topMovies, ratingsByLanguage, yearlyCounts, genrePredictions] = await Promise.all([
        fetchJson<ReportSummary>("/api/reports/summary"),
        fetchJson<TopMovie[]>("/api/reports/top-movies"),
        fetchJson<RatingByLanguage[]>("/api/reports/ratings-by-language"),
        fetchJson<YearlyCount[]>("/api/reports/yearly-counts"),
        fetchJson<GenrePrediction[]>("/api/reports/genre-predictions")
      ]);

      setPayload({ summary, topMovies, ratingsByLanguage, yearlyCounts, genrePredictions });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  const latestYear = payload.summary.latest_release_year ?? "n/a";
  const sourceLabel = payload.summary.source === "postgres" ? "PostgreSQL/RDS live" : "Demo data";

  return (
    <main>
      <section className="hero">
        <div className="heroOverlay" />
        <nav className="topbar" aria-label="Dashboard">
          <a className="brand" href="#overview" aria-label="Movie Pipeline Reports">
            <Film aria-hidden="true" />
            <span>Movie Pipeline Reports</span>
          </a>
          <div className="navPills">
            <a href="#rankings">Rankings</a>
            <a href="#languages">Languages</a>
            <a href="#ml">ML</a>
          </div>
        </nav>

        <div className="heroContent" id="overview">
          <p className="eyebrow">
            <ServerCog aria-hidden="true" />
            {process.env.NEXT_PUBLIC_PIPELINE_LABEL ?? "AWS EC2 Airflow"} reporting layer
          </p>
          <h1>Movie data products, ready for the public screen.</h1>
          <p className="lede">
            A polished reports website backed by API routes that read curated PostgreSQL tables from your Airflow pipeline.
          </p>
          <div className="heroActions">
            <a className="primaryLink" href="#rankings">Explore reports</a>
            <button className="iconButton" type="button" onClick={() => void loadReports()} aria-label="Refresh reports" title="Refresh reports">
              <RefreshCw aria-hidden="true" className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>
      </section>

      <section className="statusBand">
        <Metric icon={<Database />} label="Data source" value={sourceLabel} />
        <Metric icon={<BarChart3 />} label="Movies indexed" value={currencyFormatter.format(payload.summary.total_movies)} />
        <Metric icon={<Languages />} label="Languages" value={currencyFormatter.format(payload.summary.total_languages)} />
        <Metric icon={<CalendarDays />} label="Latest release year" value={String(latestYear)} />
        <Metric icon={<Star />} label="Top score" value={payload.summary.top_weighted_score.toFixed(2)} />
      </section>

      {error ? <div className="errorBanner">{error}</div> : null}

      <section className="contentGrid" id="rankings">
        <div className="sectionHeader">
          <p className="eyebrow">Gold reporting tables</p>
          <h2>Weighted movie rankings</h2>
        </div>
        <TopMoviesChart movies={payload.topMovies} />
        <TopMoviesTable movies={payload.topMovies} />
      </section>

      <section className="twoColumn" id="languages">
        <div>
          <div className="sectionHeader">
            <p className="eyebrow">Audience signals</p>
            <h2>Average rating by language</h2>
          </div>
          <LanguageChart rows={payload.ratingsByLanguage} />
        </div>
        <div>
          <div className="sectionHeader">
            <p className="eyebrow">Catalog growth</p>
            <h2>Releases by year</h2>
          </div>
          <YearlyChart rows={payload.yearlyCounts} />
        </div>
      </section>

      <section className="mlSection" id="ml">
        <div className="sectionHeader">
          <p className="eyebrow">
            <BrainCircuit aria-hidden="true" />
            Manual ML DAG output
          </p>
          <h2>Genre prediction quality</h2>
        </div>
        <div className="mlSummary">
          <span>Prediction accuracy</span>
          <strong>{payload.summary.prediction_accuracy == null ? "n/a" : percentFormatter.format(payload.summary.prediction_accuracy)}</strong>
        </div>
        <PredictionTable rows={payload.genrePredictions} />
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="metric">
      <div className="metricIcon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function TopMoviesChart({ movies }: { movies: TopMovie[] }) {
  const maxScore = Math.max(...movies.map((movie) => movie.weighted_score), 1);

  return (
    <div className="chartPanel">
      {movies.slice(0, 8).map((movie, index) => (
        <div className="barRow" key={movie.title}>
          <span className="rank">{index + 1}</span>
          <span className="barLabel">{movie.title}</span>
          <div className="barTrack" aria-hidden="true">
            <div className="barFill" style={{ width: `${(movie.weighted_score / maxScore) * 100}%` }} />
          </div>
          <strong>{movie.weighted_score.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}

function TopMoviesTable({ movies }: { movies: TopMovie[] }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Movie</th>
            <th>Year</th>
            <th>Language</th>
            <th>Votes</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {movies.slice(0, 10).map((movie) => (
            <tr key={`${movie.title}-${movie.release_year}`}>
              <td>{movie.title}</td>
              <td>{movie.release_year ?? "n/a"}</td>
              <td>{movie.original_language ?? "n/a"}</td>
              <td>{currencyFormatter.format(movie.vote_count)}</td>
              <td>{movie.weighted_score.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LanguageChart({ rows }: { rows: RatingByLanguage[] }) {
  const max = Math.max(...rows.map((row) => row.avg_rating), 1);

  return (
    <div className="compactChart">
      {rows.slice(0, 8).map((row) => (
        <div className="languageRow" key={row.original_language}>
          <span>{row.original_language.toUpperCase()}</span>
          <div className="barTrack" aria-hidden="true">
            <div className="barFill rating" style={{ width: `${(row.avg_rating / max) * 100}%` }} />
          </div>
          <strong>{row.avg_rating.toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}

function YearlyChart({ rows }: { rows: YearlyCount[] }) {
  const points = useMemo(() => {
    const maxCount = Math.max(...rows.map((row) => row.movie_count), 1);
    const minYear = Math.min(...rows.map((row) => row.release_year), 2000);
    const maxYear = Math.max(...rows.map((row) => row.release_year), 2024);
    const span = Math.max(maxYear - minYear, 1);

    return rows.map((row) => ({
      ...row,
      x: ((row.release_year - minYear) / span) * 100,
      y: 92 - (row.movie_count / maxCount) * 78
    }));
  }, [rows]);

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="linePanel">
      <svg viewBox="0 0 100 100" role="img" aria-label="Movies released by year">
        <path className="areaPath" d={`${path} L 100 96 L 0 96 Z`} />
        <path className="linePath" d={path} />
        {points.map((point) => (
          <circle key={point.release_year} cx={point.x} cy={point.y} r="1.7" />
        ))}
      </svg>
      <div className="axisLabels">
        <span>{rows[0]?.release_year ?? "n/a"}</span>
        <span>{rows.at(-1)?.release_year ?? "n/a"}</span>
      </div>
    </div>
  );
}

function PredictionTable({ rows }: { rows: GenrePrediction[] }) {
  return (
    <div className="tableWrap predictionTable">
      <table>
        <thead>
          <tr>
            <th>Movie</th>
            <th>Actual</th>
            <th>Predicted</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 12).map((row) => {
            const match = row.actual_genre === row.predicted_genre;

            return (
              <tr key={`${row.movie_id}-${row.title}`}>
                <td>{row.title}</td>
                <td>{row.actual_genre ?? "n/a"}</td>
                <td>
                  <span className={match ? "tag good" : "tag warn"}>{row.predicted_genre ?? "n/a"}</span>
                </td>
                <td>{row.confidence == null ? "n/a" : percentFormatter.format(row.confidence)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
