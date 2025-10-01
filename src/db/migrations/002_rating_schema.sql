-- Migration: 002_rating_schema.sql
-- Create ratings table for movie ratings (v2)
CREATE TABLE IF NOT EXISTS ratings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id   INTEGER NOT NULL,                -- TMDB movie ID
  user_id    TEXT NOT NULL,                   -- References users.id
  score      INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ensure one rating per user per movie
CREATE UNIQUE INDEX IF NOT EXISTS ux_ratings_movie_user ON ratings(movie_id, user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS ix_ratings_movie ON ratings(movie_id);
CREATE INDEX IF NOT EXISTS ix_ratings_user ON ratings(user_id);