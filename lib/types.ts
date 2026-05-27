export type TopMovie = {
  title: string;
  release_year: number | null;
  vote_average: number;
  vote_count: number;
  weighted_score: number;
  original_language?: string | null;
};

export type RatingByLanguage = {
  original_language: string;
  avg_rating: number;
  movie_count: number;
};

export type YearlyCount = {
  release_year: number;
  movie_count: number;
};

export type GenrePrediction = {
  movie_id?: number | null;
  title: string;
  actual_genre: string | null;
  predicted_genre: string | null;
  confidence?: number | null;
};

export type ReportSummary = {
  total_movies: number;
  total_languages: number;
  latest_release_year: number | null;
  top_movie: string;
  top_weighted_score: number;
  prediction_accuracy: number | null;
  latest_etl_run: string | null;
  source: "postgres" | "demo";
};

export type DashboardPayload = {
  summary: ReportSummary;
  topMovies: TopMovie[];
  ratingsByLanguage: RatingByLanguage[];
  yearlyCounts: YearlyCount[];
  genrePredictions: GenrePrediction[];
};
