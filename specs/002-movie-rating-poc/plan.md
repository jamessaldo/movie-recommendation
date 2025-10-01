# Implementation Plan: Movie Rating PoC v2

**Branch**: `002-movie-rating-poc` | **Date**: October 1, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-movie-rating-poc/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Extends v1 movie browsing with 1-5 rating functionality for logged-in users and visible community aggregates (average, count, histogram) on all movie cards. Uses HTMX for interactive rating submission and partial updates, with SQLite storage for local ratings and upsert behavior for one rating per user per movie.

## Technical Context

**Language/Version**: TypeScript with Bun v1.0+ as JavaScript runtime  
**Primary Dependencies**: Elysia.js (web framework), HTMX (frontend interactions), TailwindCSS with Franken-UI (styling)  
**Storage**: SQLite for user sessions, ratings, and local data persistence  
**Testing**: Manual browser validation and end-to-end testing  
**Target Platform**: Web application (desktop and mobile responsive)
**Project Type**: Web application (backend + frontend)  
**Performance Goals**: Sub-second rating submission and aggregate updates for PoC demonstration  
**Constraints**: 24-hour session lifetime, 1-5 integer rating scale only, no external rating sync  
**Scale/Scope**: Up to 20 pages of movies (400 movies), simple username authentication, local rating aggregates only

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack Compliance**:

- [x] Uses HTMX for UI interactions (no React/Vue/Angular)
- [x] Uses Elysia.js as web server framework
- [x] Uses SQLite for data persistence (no external databases)
- [x] Uses TailwindCSS with Franken-UI for styling (no custom CSS unless justified)
- [x] Uses Bun as JavaScript runtime and package manager

**Simplicity & Scope**:

- [x] Feature delivers single, demoable increment (rating + aggregates)
- [x] No speculative or future-oriented features
- [x] Clear separation of routes, database, and view logic
- [x] Maximum scope stays within PoC boundaries (extends v1 with rating functionality only)

**SOLID Principles (Light Application)**:

- [x] Single responsibility: separate files for routes, DB, views
- [x] Open/closed: additive changes, not disruptive modifications to v1
- [x] Interface segregation: minimal, relevant contracts only
- [x] Dependency inversion: use abstractions/helpers, not hard-coded implementations

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Single web application structure (HTMX + Elysia.js)
src/
├── app.ts              # v1 - Elysia.js server entry point
├── routes/
│   ├── auth.ts         # v1 - login/logout routes
│   ├── movies.ts       # v1 - browse/pagination routes
│   └── rating.ts       # v2 - NEW rating submission and stats routes
├── services/
│   ├── db.ts          # v1 - enhanced with rating queries
│   ├── template.ts    # v1 - enhanced with rating partials
│   └── tmdb.ts        # v1 - TMDB API service (unchanged)
├── views/
│   ├── layout.html    # v1 - base layout template
│   ├── home.html      # v1 - enhanced with rating controls
│   ├── auth/
│   │   ├── header.html   # v1 - login/logout header
│   │   └── login.html    # v1 - login form
│   ├── movies/
│   │   ├── card.html     # v1 - enhanced with rating controls + stats
│   │   └── grid.html     # v1 - movie grid layout
│   ├── rating/
│   │   ├── controls.html # v2 - NEW rating buttons (1-5)
│   │   └── stats.html    # v2 - NEW aggregates display
│   └── error/
│       └── tmdb.html     # v1 - TMDB error handling
└── db/
    ├── migrate.ts     # v1 - enhanced with rating table
    └── migrations/
        ├── 001_initial_schema.sql  # v1 - users, sessions
        └── 002_rating_schema.sql   # v2 - NEW ratings table

public/                # Static assets served by Elysia.js
└── styles.css        # TailwindCSS + Franken-UI compiled

tests/                 # Manual validation scripts
specs/                 # Feature specifications
```

**Structure Decision**: Single web application using HTMX + Elysia.js architecture where Elysia.js serves both HTML pages and API endpoints, with HTMX handling frontend interactions. Extends existing v1 structure with additive rating functionality while preserving all v1 functionality.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Implementation Plan Details**:

### 1) Routes & Behaviors

**POST `/rate`** (auth required)

- Body: `movie_id` (int), `score` (int 1..5)
- Validate session (not expired); else return session expired partial
- Validate `score ∈ {1..5}`; reject with 422 partial
- **Upsert** `(movie_id, user_id)` → insert or update `score`, set `updated_at`
- Return **stats partial** for this `movie_id` + out-of-band swap for rating highlights
- HTMX: `hx-post="/rate"` targeting `#stats-{movie_id}` with `hx-swap="outerHTML"`

**GET `/stats/:movie_id`** (public)

- Returns stats partial (avg, count, histogram, user's rating if logged in)
- Used for independent stats refresh

### 2) Data Model (SQLite) — Delta

```sql
CREATE TABLE IF NOT EXISTS ratings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id   INTEGER NOT NULL,                -- TMDB id
  user_id    TEXT NOT NULL,                   -- FK users.id
  score      INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_ratings_movie_user ON ratings(movie_id, user_id);
CREATE INDEX IF NOT EXISTS ix_ratings_movie ON ratings(movie_id);
CREATE INDEX IF NOT EXISTS ix_ratings_user  ON ratings(user_id);
```

### 3) Key SQL Queries

**Upsert**: `INSERT INTO ratings(movie_id, user_id, score) VALUES (?, ?, ?) ON CONFLICT(movie_id, user_id) DO UPDATE SET score = excluded.score, updated_at = CURRENT_TIMESTAMP;`

**Stats**: `SELECT COUNT(*) AS count, ROUND(AVG(score), 2) AS avg, SUM(score = 1) AS h1, SUM(score = 2) AS h2, SUM(score = 3) AS h3, SUM(score = 4) AS h4, SUM(score = 5) AS h5 FROM ratings WHERE movie_id = ?;`

### 4) Views & HTMX Patterns

- **Card rating group** `id="rating-{movie_id}"`: 5 buttons (1..5) with form post
- **Stats block** `id="stats-{movie_id}"`: Shows "Your rating: X★", "Avg X.XX · N ratings", histogram
- **Out-of-band update**: Visual highlighting of selected rating button

### 5) Error Handling

- Session expired → inline alert + page refresh
- Invalid score → 422 with error partial
- Unknown movie_id → 404 "Movie not found" error

**Task Generation Strategy**:

1. Database migration task (ratings table + indexes)
2. Rating service implementation (upsert + stats queries)
3. Rating routes implementation (POST /rate, GET /stats/:id)
4. Rating views/partials (controls.html, stats.html)
5. Movie card enhancement (integrate rating controls + stats)
6. HTMX integration (form handling + partial swaps)
7. Session validation enhancement
8. Manual validation testing

**Ordering Strategy**: Database → Services → Routes → Views → Integration → Testing

**Estimated Output**: 8-10 numbered, ordered tasks in tasks.md

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
