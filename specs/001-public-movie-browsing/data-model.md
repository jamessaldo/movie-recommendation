# Data Model: Public Movie Browsing + Username Login

## Entity Definitions

### User Entity

**Purpose**: Represents a registered user account in the system.

**Schema**:

```sql
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,           -- UUID v4
  username     TEXT NOT NULL UNIQUE,       -- 4-30 chars, alphanumeric + underscore, case-sensitive
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_username ON users(username);
```

**Validation Rules**:

- username: Required, 4-30 characters, regex `^[A-Za-z0-9_]{4,30}$`
- username: Case-sensitive, no normalization
- username: Cannot be reserved words: "admin", "root", "system"
- id: Generated UUID v4
- timestamps: Automatic management

**Relationships**:

- One-to-many with Session (user can have multiple sessions)

### Session Entity

**Purpose**: Manages user authentication sessions with 24-hour expiration.

**Schema**:

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,             -- Random session ID (32 chars)
  user_id    TEXT NOT NULL,                -- Foreign key to users.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,            -- created_at + 24 hours
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Validation Rules**:

- id: Generated cryptographically secure random string (32 characters)
- user_id: Must exist in users table
- expires_at: Exactly 24 hours from created_at, no renewal
- Expired sessions should be cleaned up periodically

**Relationships**:

- Many-to-one with User (session belongs to one user)

### Movie Entity (External)

**Purpose**: Represents movie data from TMDB API (not stored locally).

**TypeScript Interface**:

```typescript
interface Movie {
  id: number; // TMDB movie ID
  title: string; // Movie title
  release_date: string; // YYYY-MM-DD format
  poster_path: string | null; // Relative path for poster image
  vote_average: number; // TMDB rating (0-10)
  overview?: string; // Movie description (optional for v1)
}

interface TMDBResponse {
  page: number; // Current page (1-20)
  total_pages: number; // Total available pages
  total_results: number; // Total movies count
  results: Movie[]; // Array of 20 movies
}
```

**Data Flow**:

- Fetched from TMDB API: `GET /3/movie/top_rated?page={page}`
- Not persisted locally (except potential caching)
- Poster URL construction: `https://image.tmdb.org/t/p/w342{poster_path}`

## Data Validation

### Username Validation

```typescript
function validateUsername(username: string): ValidationResult {
  if (!username || username.length < 4 || username.length > 30) {
    return { valid: false, error: "Username must be 4-30 characters" };
  }

  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, and underscores",
    };
  }

  const reserved = ["admin", "root", "system"];
  if (reserved.includes(username.toLowerCase())) {
    return { valid: false, error: "Username is reserved" };
  }

  return { valid: true };
}
```

### Session Management

```typescript
function createSession(userId: string): Session {
  const sessionId = generateSecureId(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return {
    id: sessionId,
    user_id: userId,
    created_at: new Date(),
    expires_at: expiresAt,
  };
}

function isSessionValid(session: Session): boolean {
  return new Date() < new Date(session.expires_at);
}
```

## Database Migrations

### Initial Schema Migration

```sql
-- Migration: 001_initial_schema.sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  username     TEXT NOT NULL UNIQUE,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
```

## State Transitions

### User Lifecycle

1. **Registration**: New username → Create user record → Generate session
2. **Login**: Existing username → Validate user → Generate new session
3. **Session Active**: Valid session → User authenticated
4. **Session Expired**: 24h timeout → User logged out
5. **Logout**: User action → Expire session → User logged out

### Session Lifecycle

1. **Creation**: User login/register → Generate session with 24h TTL
2. **Active**: Session within TTL → Authentication valid
3. **Expired**: Past TTL → Session invalid, cleanup eligible
4. **Revoked**: Explicit logout → Session invalidated immediately

## Data Volume Estimates

### Users

- Expected: 1-5 users for PoC
- Schema size: ~100 bytes per user
- Growth rate: Minimal for demo purposes

### Sessions

- Expected: 1-10 active sessions
- Schema size: ~150 bytes per session
- Cleanup: Daily cleanup of expired sessions

### Movies (External)

- Available: ~8000 top-rated movies from TMDB
- Accessible: 400 movies (20 pages × 20 per page)
- Caching: Optional, not required for v1
