# Movie Pipeline Reports

Public reporting website for the Airflow movie data pipeline. The browser talks only to Next.js API routes; API routes query PostgreSQL/RDS with server-side credentials.

## Architecture

```mermaid
flowchart LR
    User["Users"] --> Web["Next.js Reports Website"]
    Web --> API["Next.js API Routes"]
    API --> DB["PostgreSQL / AWS RDS"]
    Airflow["Airflow on EC2"] --> DB
```

## Recommended AWS Hosting

Use **AWS Amplify Hosting for the Next.js app** and **AWS RDS for PostgreSQL** as the data source.

Why this is the best first production path:

- One deployable app contains the public React frontend and private server-side API routes.
- Database credentials stay in Amplify environment variables, never in browser JavaScript.
- Amplify gives managed HTTPS, branch previews, build logs, and GitHub-based deploys with less operational work than another EC2 instance.
- The app can still be containerized later if you want to run it beside Airflow on EC2 or ECS.

Production hardening:

- Put RDS in private subnets if possible.
- Allow inbound RDS traffic only from the API runtime path you choose.
- Create a read-only database user that can select only from reporting tables.
- Keep the website on curated tables: `gold_top_movies`, `gold_avg_rating_by_language`, `gold_yearly_counts`, `movies_silver`, and `ml_genre_predictions`.

If Amplify cannot reach your private RDS from your current VPC layout, use **ECS Fargate or EC2 with Docker** inside the VPC for the Next.js app, then place an Application Load Balancer in front of it.

## API Endpoints

```text
GET /api/reports/top-movies
GET /api/reports/ratings-by-language
GET /api/reports/yearly-counts
GET /api/reports/genre-predictions
GET /api/reports/summary
```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `DATABASE_URL`, the API returns demo data so the full UI remains usable.

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set:

```text
DATABASE_URL=postgresql://report_user:strong_password@your-rds-endpoint:5432/movie_db?sslmode=require
PGSSL=true
NEXT_PUBLIC_PIPELINE_LABEL=AWS EC2 Airflow
```

## Expected Table Shapes

The queries expect these reporting columns:

```text
gold_top_movies:
  title, release_year, vote_average, vote_count, weighted_score, original_language

gold_avg_rating_by_language:
  original_language, avg_rating, movie_count

gold_yearly_counts:
  release_year, movie_count

movies_silver:
  release_year, original_language

ml_genre_predictions:
  movie_id, title, actual_genre, predicted_genre, confidence
```

If your actual column names differ, update [lib/reports.ts](/Users/randalcarr/Documents/movie-etl-web/lib/reports.ts).
