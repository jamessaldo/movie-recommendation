# Data Model: Movie Rating PoC v2

## Entities

### Rating (NEW in v2)

**Purpose**: Represents a user's 1-5 evaluation of a movie

**Fields**:

- `id`: INTEGER PRIMARY KEY AUTOINCREMENT - Unique rating identifier
- `movie_id`: INTEGER NOT NULL - TMDB movie identifier (foreign reference, not enforced)
- `user_id`: TEXT NOT NULL - References users.id from v1 schema
- `score`: INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5) - Rating value 1-5
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP - Initial rating timestamp
- `updated_at`: DATETIME - Last modification timestamp

**Constraints**:

- UNIQUE(movie_id, user_id) - One rating per user per movie
- score must be 1, 2, 3, 4, or 5 (enforced by CHECK constraint)

**Indexes**:

- `ux_ratings_movie_user` ON (movie_id, user_id) - Unique constraint + fast lookup
- `ix_ratings_movie` ON (movie_id) - Fast aggregate queries per movie
- `ix_ratings_user` ON (user_id) - Fast user rating lookup

### User (from v1, unchanged)

**Purpose**: Username-only accounts for authentication

**Fields**:

- `id`: TEXT PRIMARY KEY - Case-sensitive username 4-30 chars [A-Za-z0-9_]
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### Session (from v1, unchanged)

**Purpose**: 24-hour authentication sessions

**Fields**:

- `id`: TEXT PRIMARY KEY - Session identifier
- `user_id`: TEXT NOT NULL - References users.id
- `expires_at`: DATETIME NOT NULL - 24-hour TTL from creation
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

## Relationships

- Rating.user_id → User.id (logical foreign key, not enforced)
- Rating.movie_id → TMDB API (external reference, movies not stored locally)
- Session.user_id → User.id (existing v1 relationship)

## State Transitions

### Rating Lifecycle

1. **Create**: User submits first rating for a movie

   - INSERT new rating record
   - Set created_at and updated_at to current timestamp

2. **Update**: User changes existing rating for same movie

   - UPDATE score and updated_at via UPSERT pattern
   - Preserves original created_at timestamp

3. **Read**: Calculate aggregates for movie display
   - No state change, aggregates computed from current ratings

**Note**: No delete operation in v2 scope (ratings are permanent once submitted)

## Validation Rules

### Input Validation

- movie_id: Positive integer required
- user_id: Must exist in users table and have valid session
- score: Integer 1-5 only, no decimals or out-of-range values

### Business Rules

- One rating per (user_id, movie_id) combination enforced by unique constraint
- Session must not be expired (expires_at > current_timestamp)
- Movies don't need to exist locally (TMDB IDs accepted if valid format)

## Aggregate Calculations

### Per-Movie Statistics

```sql
-- Average rating (2 decimal places)
ROUND(AVG(score), 2)

-- Total rating count
COUNT(*)

-- Histogram (counts per rating value)
SUM(score = 1) AS count_1star,
SUM(score = 2) AS count_2star,
SUM(score = 3) AS count_3star,
SUM(score = 4) AS count_4star,
SUM(score = 5) AS count_5star
```

### User-Specific Data

```sql
-- Current user's rating for a movie
SELECT score FROM ratings WHERE movie_id = ? AND user_id = ?
```
