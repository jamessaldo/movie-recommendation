# Tasks: Movie Rating PoC v2

**Input**: Design documents from `/specs/002-movie-rating-poc/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Feature Summary

Extends v1 movie browsing with 1-5 rating functionality for logged-in users and visible community aggregates (average, count, histogram) on all movie cards. Uses HTMX for interactive rating submission and partial updates, with SQLite storage for local ratings and upsert behavior for one rating per user per movie.

## Phase 3.1: Database Foundation

### T001 - Database Migration: Ratings Table & Indexes [✓ COMPLETED]

**Dependencies**: none (extends v1 schema)
**Files**: `src/db/migrations/002_rating_schema.sql`

**Steps**:

- Create idempotent migration for ratings table with columns: id (PK), movie_id (NOT NULL), user_id (NOT NULL), score (CHECK 1-5), created_at, updated_at
- Add UNIQUE constraint on (movie_id, user_id) for one-rating-per-user-per-movie
- Create indexes: ux_ratings_movie_user (unique), ix_ratings_movie, ix_ratings_user
- Integrate with existing migration runner in `src/db/migrate.ts`

**Done When**: Migration runs successfully and `.schema ratings` shows correct structure
**Manual Validation**: Run `bun run migrate` and verify table creation with `sqlite3 app.db ".schema ratings"`

### T002 [P] - Rating Service: Upsert & Stats Queries [✓ COMPLETED]

**Dependencies**: T001
**Files**: `src/services/rating.ts`

**Steps**:

- Implement `upsertRating(movieId: number, userId: string, score: number)` using SQLite UPSERT
- Implement `getMovieStats(movieId: number)` returning {count, avg, h1, h2, h3, h4, h5}
- Implement `getUserRating(movieId: number, userId: string)` returning score or null
- Use prepared statements for performance
- Handle edge cases (no ratings, invalid IDs)

**Done When**: All functions return correct data types and handle empty result sets
**Manual Validation**: Test queries in REPL with sample data

## Phase 3.2: HTMX Views & Partials

### T003 [P] - Rating Controls Partial [✓ COMPLETED]

**Dependencies**: none
**Files**: `src/views/rating/controls.html`

**Steps**:

- Create HTMX form with 5 buttons (1-5 stars) posting to `/rate`
- Support logged-in state (enabled buttons) vs logged-out (disabled with tooltip)
- Include hidden movie_id input and proper HTMX targeting
- Use Franken-UI button components with hover/active states
- Support visual highlighting of selected rating

**Done When**: Partial renders correctly for both logged-in and logged-out states
**Manual Validation**: Render in isolation and verify button states and HTMX attributes

### T004 [P] - Stats Display Partial [✓ COMPLETED]

**Dependencies**: none  
**Files**: `src/views/rating/stats.html`

**Steps**:

- Create partial for displaying "Your rating: X★" (if applicable)
- Show aggregate stats in format "Avg X.XX · N ratings"
- Display histogram with Franken-UI badges: "1★(5) 2★(12) 3★(34) 4★(56) 5★(35)"
- Handle zero ratings case with appropriate messaging
- Support dimmed display for zero histogram values

**Done When**: Partial handles all data states (empty, partial, full ratings)
**Manual Validation**: Test with various data combinations including edge cases

## Phase 3.3: API Endpoints

### T005 - POST /rate Endpoint [✓ COMPLETED]

**Dependencies**: T002
**Files**: `src/routes/rating.ts`

**Steps**:

- Validate session existence and expiration (24h TTL, no renewal)
- Parse and validate movie_id (positive integer) and score (1-5)
- Call rating service to upsert rating
- Fetch updated stats and user rating
- Return stats partial + out-of-band rating controls update
- Handle all error cases with appropriate HTMX partials

**Done When**: Endpoint handles all success/error cases and returns proper HTMX responses
**Manual Validation**: Submit ratings via form and verify database updates + UI responses

### T006 [P] - GET /stats/:movie_id Endpoint [✓ COMPLETED]

**Dependencies**: T002
**Files**: `src/routes/rating.ts`

**Steps**:

- Parse movie_id from URL parameters
- Fetch movie stats and user rating (if logged in)
- Return stats partial identical to POST /rate response
- Handle public access (no authentication required)

**Done When**: Endpoint returns consistent stats data accessible to all users
**Manual Validation**: Access endpoint directly and compare output to movie card stats

## Phase 3.4: Integration & Enhancement

### T007 - Movie Card Integration [✓ COMPLETED]

**Dependencies**: T003, T004, T005
**Files**: `src/views/movies/card.html`

**Steps**:

- Integrate rating controls partial into movie card layout
- Add stats display area with appropriate DOM IDs (#stats-{movie_id})
- Ensure HTMX form targeting works correctly
- Maintain existing v1 card functionality and styling
- Position rating elements appropriately within card layout

**Done When**: Movie cards show rating controls and stats without breaking existing layout
**Manual Validation**: Browse movie grid and verify rating elements appear on all cards

### T008 - Template Service Enhancement [✓ COMPLETED]

**Dependencies**: T003, T004
**Files**: `src/services/template.ts`

**Steps**:

- Add functions to render rating controls and stats partials
- Support data injection for user authentication state
- Integrate with existing template rendering system
- Maintain backward compatibility with v1 template usage

**Done When**: Template service can render all rating-related partials
**Manual Validation**: Verify partial rendering works in server responses

### T009 - Error Handling & UX [✓ COMPLETED]

**Dependencies**: T005
**Files**: `src/routes/rating.ts`, `src/views/error/`

**Steps**:

- Create error partials for session expiry, validation errors, not found
- Implement proper HTTP status codes (401, 422, 404)
- Add session expiry detection with page refresh trigger
- Handle rapid-click scenarios gracefully (last write wins)
- Provide clear user feedback for all error states

**Done When**: All error scenarios provide appropriate user feedback
**Manual Validation**: Test error conditions and verify user experience

## Phase 3.5: Validation & Polish

### T010 [P] - Session Validation Enhancement [✓ COMPLETED]

**Dependencies**: T005
**Files**: `src/services/auth.ts`

**Steps**:

- Enhance session validation to check expiration without renewal
- Maintain v1 session behavior (24h TTL, no automatic renewal)
- Provide clear session state information to rating endpoints
- Document session handling for rating functionality

**Done When**: Session validation respects v1 rules and supports rating requirements
**Manual Validation**: Test session expiry scenarios with rating attempts

### T011 [P] - Observability & Logging [✓ COMPLETED]

**Dependencies**: T005, T006
**Files**: `src/services/logger.ts`, rating route files

**Steps**:

- Log rating submission events with {userId, movieId, score}
- Track stats query performance and latency
- Maintain existing v1 logging patterns
- Add rating-specific metrics for PoC demonstration

**Done When**: Rating interactions generate appropriate log entries
**Manual Validation**: Review server logs during rating activity

### T012 - End-to-End Acceptance Testing [✓ COMPLETED]

**Dependencies**: T001-T011
**Files**: All implementation files

**Steps**:

- Execute all acceptance scenarios from specification
- Verify logged-in rating submission and updates work correctly
- Confirm logged-out users see disabled controls but visible aggregates
- Test error handling for invalid inputs and expired sessions
- Validate aggregate calculations and display accuracy
- Ensure v1 functionality remains unchanged

**Done When**: All specification acceptance criteria pass
**Manual Validation**: Complete quickstart.md validation checklist

## Dependencies Graph

```
T001 (DB Migration)
  ↓
T002 (Rating Service) ← T003,T004 (Partials) [P]
  ↓                      ↓
T005 (POST endpoint) ← T006 (GET endpoint) [P]
  ↓                      ↓
T007 (Card Integration) ← T008 (Template Service) [P]
  ↓
T009 (Error Handling) ← T010,T011 (Validation & Logging) [P]
  ↓
T012 (Acceptance Testing)
```

## Parallel Execution Examples

**Phase 1 (Parallel)**:

```bash
# Can run simultaneously (different files):
bun task T002  # Rating service implementation
bun task T003  # Rating controls partial
bun task T004  # Stats display partial
```

**Phase 2 (Sequential then Parallel)**:

```bash
# T005 must complete first, then:
bun task T006  # GET stats endpoint
bun task T008  # Template service enhancement
```

**Phase 3 (Parallel)**:

```bash
# Final polish tasks:
bun task T010  # Session validation
bun task T011  # Observability logging
```

## Validation Checklist

- [x] Database schema task (T001) before service layer (T002)
- [x] Tests embedded in validation steps (manual testing approach)
- [x] All API contracts have implementation tasks (T005, T006)
- [x] HTMX partials have dedicated tasks (T003, T004)
- [x] Error handling covered (T009)
- [x] Integration tasks for existing components (T007, T008)
- [x] Session validation maintains v1 behavior (T010)
- [x] End-to-end acceptance testing (T012)
- [x] Parallel tasks use different files to avoid conflicts
- [x] All tasks specify exact file paths and clear completion criteria
