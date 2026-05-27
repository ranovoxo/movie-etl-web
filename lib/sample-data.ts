import type {
  GenrePrediction,
  RatingByLanguage,
  ReportSummary,
  TopMovie,
  YearlyCount
} from "./types";

export const topMovies: TopMovie[] = [
  { title: "The Shawshank Redemption", release_year: 1994, vote_average: 8.7, vote_count: 26500, weighted_score: 8.62, original_language: "en" },
  { title: "The Godfather", release_year: 1972, vote_average: 8.7, vote_count: 20100, weighted_score: 8.58, original_language: "en" },
  { title: "Spirited Away", release_year: 2001, vote_average: 8.5, vote_count: 15800, weighted_score: 8.39, original_language: "ja" },
  { title: "Parasite", release_year: 2019, vote_average: 8.5, vote_count: 18100, weighted_score: 8.38, original_language: "ko" },
  { title: "The Dark Knight", release_year: 2008, vote_average: 8.5, vote_count: 32300, weighted_score: 8.36, original_language: "en" },
  { title: "Pulp Fiction", release_year: 1994, vote_average: 8.5, vote_count: 27800, weighted_score: 8.34, original_language: "en" },
  { title: "City of God", release_year: 2002, vote_average: 8.4, vote_count: 7200, weighted_score: 8.22, original_language: "pt" },
  { title: "Cinema Paradiso", release_year: 1988, vote_average: 8.4, vote_count: 4200, weighted_score: 8.12, original_language: "it" }
];

export const ratingsByLanguage: RatingByLanguage[] = [
  { original_language: "ja", avg_rating: 7.38, movie_count: 412 },
  { original_language: "ko", avg_rating: 7.21, movie_count: 287 },
  { original_language: "fr", avg_rating: 6.98, movie_count: 611 },
  { original_language: "it", avg_rating: 6.83, movie_count: 359 },
  { original_language: "pt", avg_rating: 6.76, movie_count: 126 },
  { original_language: "es", avg_rating: 6.64, movie_count: 504 },
  { original_language: "en", avg_rating: 6.52, movie_count: 8320 },
  { original_language: "de", avg_rating: 6.31, movie_count: 241 }
];

export const yearlyCounts: YearlyCount[] = [
  { release_year: 2014, movie_count: 620 },
  { release_year: 2015, movie_count: 702 },
  { release_year: 2016, movie_count: 746 },
  { release_year: 2017, movie_count: 812 },
  { release_year: 2018, movie_count: 861 },
  { release_year: 2019, movie_count: 904 },
  { release_year: 2020, movie_count: 530 },
  { release_year: 2021, movie_count: 694 },
  { release_year: 2022, movie_count: 783 },
  { release_year: 2023, movie_count: 852 },
  { release_year: 2024, movie_count: 711 }
];

export const genrePredictions: GenrePrediction[] = [
  { movie_id: 1, title: "Starlight Protocol", actual_genre: "Science Fiction", predicted_genre: "Science Fiction", confidence: 0.91 },
  { movie_id: 2, title: "The Last Orchard", actual_genre: "Drama", predicted_genre: "Drama", confidence: 0.86 },
  { movie_id: 3, title: "Harbor Chase", actual_genre: "Thriller", predicted_genre: "Action", confidence: 0.73 },
  { movie_id: 4, title: "Midnight Ledger", actual_genre: "Crime", predicted_genre: "Crime", confidence: 0.88 },
  { movie_id: 5, title: "A Small Bright Thing", actual_genre: "Romance", predicted_genre: "Drama", confidence: 0.69 },
  { movie_id: 6, title: "Signal Fires", actual_genre: "Adventure", predicted_genre: "Adventure", confidence: 0.82 }
];

export const summary: ReportSummary = {
  total_movies: 11482,
  total_languages: 38,
  latest_release_year: 2024,
  top_movie: topMovies[0].title,
  top_weighted_score: topMovies[0].weighted_score,
  prediction_accuracy: 0.67,
  latest_etl_run: null,
  source: "demo"
};
