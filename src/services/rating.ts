import { Database } from "bun:sqlite";
import { DatabaseMigrator } from "../db/migrate";

export interface MovieStats {
  count: number;
  avg: number | null;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
}

export class RatingService {
  private db: Database;

  constructor() {
    const migrator = new DatabaseMigrator();
    this.db = migrator.getDatabase();
  }

  /**
   * Insert or update a user's rating for a movie
   * Implements the one-rating-per-user-per-movie constraint via UPSERT
   */
  async upsertRating(
    movieId: number,
    userId: string,
    score: number
  ): Promise<void> {
    if (score < 1 || score > 5) {
      throw new Error("Score must be between 1 and 5");
    }

    const stmt = this.db.prepare(`
      INSERT INTO ratings(movie_id, user_id, score)
      VALUES (?, ?, ?)
      ON CONFLICT(movie_id, user_id) DO UPDATE
        SET score = excluded.score,
            updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(movieId, userId, score);
  }

  /**
   * Get aggregate statistics for a movie
   * Returns count, average (2 decimal places), and histogram (h1-h5)
   */
  async getMovieStats(movieId: number): Promise<MovieStats> {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) AS count,
        ROUND(AVG(score), 2) AS avg,
        SUM(score = 1) AS h1,
        SUM(score = 2) AS h2,
        SUM(score = 3) AS h3,
        SUM(score = 4) AS h4,
        SUM(score = 5) AS h5
      FROM ratings
      WHERE movie_id = ?
    `);

    const result = stmt.get(movieId) as any;

    return {
      count: result.count || 0,
      avg: result.count > 0 ? result.avg : null,
      h1: result.h1 || 0,
      h2: result.h2 || 0,
      h3: result.h3 || 0,
      h4: result.h4 || 0,
      h5: result.h5 || 0,
    };
  }

  /**
   * Get a specific user's rating for a movie
   * Returns the score (1-5) or null if no rating exists
   */
  async getUserRating(movieId: number, userId: string): Promise<number | null> {
    const stmt = this.db.prepare(`
      SELECT score FROM ratings 
      WHERE movie_id = ? AND user_id = ? 
      LIMIT 1
    `);

    const result = stmt.get(movieId, userId) as { score: number } | undefined;
    return result ? result.score : null;
  }

  /**
   * Log a rating event for observability
   */
  logRatingEvent(userId: string, movieId: number, score: number): void {
    console.log(
      `[RATING] ${new Date().toISOString()} - User ${userId} rated movie ${movieId} with score ${score}`
    );
  }

  /**
   * Time and log stats query performance
   */
  async getMovieStatsWithTiming(movieId: number): Promise<MovieStats> {
    const startTime = performance.now();
    const stats = await this.getMovieStats(movieId);
    const duration = performance.now() - startTime;

    console.log(
      `[STATS] ${new Date().toISOString()} - Stats query for movie ${movieId} took ${duration.toFixed(
        2
      )}ms`
    );

    return stats;
  }
}
