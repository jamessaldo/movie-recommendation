# Tasks: Public Movie Browsing + Username Login

**Input**: Design documents from `/specs/001-public-movie-browsing/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/

## Tasks

### V1-T01 — SQLite migrations: users & sessions

- **Dependencies**: none
- **Steps**:
  - Create `src/db/migrations/001_initial_schema.sql`
  - Create `users(id TEXT PK, username TEXT UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`
  - Create `sessions(id TEXT PK, user_id TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME NOT NULL)` + FK to users
  - Add unique index on users.username and indexes on sessions for performance
  - Create migration runner in `src/db/migrate.ts`
- **Done When**: Running the migration twice is idempotent; tables exist with correct schemas
- **Manual Validation**: `sqlite3 database.db ".schema users"`, ".schema sessions" show expected columns

### V1-T02 — TMDB helper for Top Rated (page 1..20)

- **Dependencies**: none
- **Steps**:
  - Create `src/services/tmdb.ts`
  - Implement `getTopRated(page: number)` using `TMDB_TOKEN` env var
  - Handle page validation (1-20), throw typed error for API failures
  - Poster URL builder: `https://image.tmdb.org/t/p/w342{poster_path}`
  - Return interface with `id, title, release_date, poster_path, vote_average`
- **Done When**: `getTopRated(1)` returns 20 items with correct fields; errors throw properly
- **Manual Validation**: Temporarily log first item to console; verify fields present

### V1-T03 — Route: GET / (grid + pager, clamp 1..20)

- **Dependencies**: V1-T02
- **Steps**:
  - Create `src/routes/movies.ts` with GET / handler
  - Parse `?page` query param, default to 1
  - If page <1 or >20 → redirect to `/?page=1` and set flash notice "Redirected from invalid page"
  - Fetch movies via TMDB service, render grid with 20 cards
  - Render pagination controls with hx-get links for page navigation
- **Done When**: `/?page=1` loads 20 cards; `/?page=0` redirects to `/?page=1` with notice
- **Manual Validation**: Visit `/?page=0` and see "Redirected from invalid page" flash message

### V1-T04 — Views: Franken-UI card + disabled rating buttons

- **Dependencies**: V1-T03
- **Steps**:
  - Create `src/views/movies/card.html` template
  - Movie card shows poster (or placeholder), title, release year, TMDB average
  - Add 5 disabled star buttons using Franken-UI button group with `disabled` attribute
  - Add tooltip "Coming in v2" to rating button group
  - Style with TailwindCSS responsive grid classes
- **Done When**: All movie cards render with disabled rating controls and tooltip
- **Manual Validation**: Hover over rating buttons: tooltip "Coming in v2" appears; buttons are disabled

### V1-T05 — Views: Layout + navbar + flash + partial slots

- **Dependencies**: V1-T03
- **Steps**:
  - Create `src/views/layout.html` with navbar and main content area
  - Add slot `#auth-slot` in navbar for login/user header
  - Add flash notice area using Franken-UI alert component
  - Include HTMX script and TailwindCSS styles
  - Flash messages disappear after one render cycle
- **Done When**: Navbar and flash region visible; flash messages show and clear properly
- **Manual Validation**: Trigger invalid page redirect; see flash message above movie grid

### V1-T06 — Route: GET /login (username form)

- **Dependencies**: V1-T05
- **Steps**:
  - Create login route in `src/routes/auth.ts`
  - Create `src/views/auth/login.html` with Franken-UI form
  - Username input with placeholder and helper text explaining rules (4-30 chars, alphanumeric + underscore)
  - If user already logged in (valid session), redirect to `/`
- **Done When**: `/login` shows form for logged-out users; logged-in users get redirected
- **Manual Validation**: Visit `/login` when logged out → see form; when logged in → redirected to homepage

### V1-T07 — Route: POST /login (register-or-login)

- **Dependencies**: V1-T01, V1-T06
- **Steps**:
  - Add POST /login handler in `src/routes/auth.ts`
  - Validate username with regex `^[A-Za-z0-9_]{4,30}$`
  - Block reserved names: "admin", "root", "system" (case-insensitive check)
  - If username exists (case-sensitive exact match) → create new session
  - If username doesn't exist → create user then session
  - Set session expires_at = now + 24 hours, create signed httpOnly `auth_sid` cookie
  - Return header partial for HTMX swap targeting `#auth-slot`: shows `@username` + logout button
- **Done When**: New usernames create account and log in; existing usernames log in without errors
- **Manual Validation**: Submit form via HTMX; navbar swaps to show `@username` and logout button

### V1-T08 — Route: POST /logout

- **Dependencies**: V1-T07
- **Steps**:
  - Add POST /logout handler in `src/routes/auth.ts`
  - Find session by cookie, delete session row from database
  - Clear `auth_sid` cookie (set to empty with Max-Age=0)
  - Return header partial with login form for HTMX swap targeting `#auth-slot`
- **Done When**: After logout, page refresh shows logged-out state; session invalidated
- **Manual Validation**: Click "Logout" button; header swaps back to login form

### V1-T09 — TMDB error page + router error handling

- **Dependencies**: V1-T02, V1-T03
- **Steps**:
  - Create `src/views/error/tmdb.html` with Franken-UI alert and "Try Again" button linking to `/?page=1`
  - Add `GET /error/tmdb` route in `src/routes/movies.ts`
  - In GET `/` route, catch TMDB fetch errors and redirect to `/error/tmdb`
  - Style error page with appropriate messaging about temporary unavailability
- **Done When**: Simulated TMDB failure routes user to error page with functional retry button
- **Manual Validation**: Temporarily break TMDB token; load `/` → redirected to error page with retry

### V1-T10 — HTMX pager interactions & partial swap

- **Dependencies**: V1-T03, V1-T05
- **Steps**:
  - Update movie grid template with `hx-get="/?page=N"` on pagination links
  - Target `#movie-grid` for partial updates using `hx-target` attribute
  - Use `hx-swap="outerHTML"` to replace entire grid including pagination
  - Ensure flash notices render correctly above grid on page redirects
  - Preserve URL in browser address bar during navigation
- **Done When**: Clicking prev/next updates only movie grid content without full page reload
- **Manual Validation**: Click Next/Prev buttons; browser network tab shows partial reloads only

### V1-T11 — Bun/Tailwind/Franken-UI wiring

- **Dependencies**: none
- **Steps**:
  - Create `tailwind.config.js` with Franken-UI plugin configuration
  - Create `src/styles.css` with Tailwind imports and custom styles
  - Add build script: `bunx tailwindcss -i ./src/styles.css -o ./public/styles.css --watch`
  - Configure Bun scripts in `package.json`: `bun dev`, `bun run start`
  - Ensure Franken-UI components (buttons, cards, forms, alerts) render correctly
- **Done When**: TailwindCSS compiles successfully; Franken-UI component classes apply proper styling
- **Manual Validation**: Inspect button/card elements; verify Franken-UI styles are applied correctly

### V1-T12 — Smoke testing & health route

- **Dependencies**: all above tasks
- **Steps**:
  - Add `GET /healthz` route returning `{ "ok": true, "timestamp": "...", "services": {...} }`
  - Include basic health checks for database connectivity and TMDB API availability
  - Execute all acceptance scenarios from spec.md:
    1. Homepage loads 20 movies
    2. Pagination works between pages 1-20
    3. Invalid pages redirect with notification
    4. New username registration works
    5. Existing username login works
    6. Logout clears session
    7. Movie cards show disabled rating buttons with tooltip
  - Verify session persistence across page navigation
- **Done When**: `/healthz` returns 200 OK with JSON; all 7 acceptance scenarios pass manually
- **Manual Validation**: Hit `/healthz` endpoint (expect 200 + JSON), then execute spec's acceptance scenarios

## Dependencies Overview

```
T001 (DB) → T007, T008
T002 (TMDB) → T003, T009
T003 (Movies Route) → T004, T010
T004 (Movie Cards) → T012
T005 (Layout) → T006, T010
T006 (Login Page) → T007
T007 (Login Logic) → T008, T012
T008 (Logout) → T012
T009 (Error Handling) → T012
T010 (HTMX) → T012
T011 (Styling) → T004, T005, T012
```

## Parallel Execution Groups

```
# Group 1 (No dependencies):
T001, T002, T011

# Group 2 (After T001, T002):
T003, T005, T006

# Group 3 (After T003, T005):
T004, T007, T010

# Group 4 (After T007):
T008, T009

# Group 5 (Final):
T012
```

## Notes

- Respect constitutional principles: simplicity first, SOLID separation, Bun + HTMX + Elysia.js + SQLite + Franken-UI stack
- Follow TDD: contract tests before implementation where applicable
- Maintain 24-hour session TTL with no automatic renewal
- Preserve case-sensitive username validation and reserved word blocking
- Use server-side rendering with HTMX for dynamic interactions
- Keep PoC scope: focus on core functionality over advanced features
