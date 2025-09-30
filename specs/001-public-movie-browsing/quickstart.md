# Quickstart Guide: Public Movie Browsing + Username Login

## Prerequisites

- Bun v1.0 or later installed
- TMDB API key (free registration at themoviedb.org)
- Git (for version control)

## Environment Setup

1. **Clone and setup project**:

   ```bash
   git checkout 001-public-movie-browsing
   cd /path/to/movie-recommendation
   bun install
   ```

2. **Environment Configuration**:
   Create `.env` file in project root:

   ```env
   TMDB_TOKEN=your_tmdb_bearer_token_here
   SESSION_SECRET=your_32_char_session_secret_here
   PORT=3000
   NODE_ENV=development
   ```

3. **Database Initialization**:

   ```bash
   bun run db:migrate
   ```

4. **Install and Build TailwindCSS**:
   ```bash
   bunx tailwindcss -i ./src/styles.css -o ./public/styles.css --watch
   ```

## Development Workflow

### Start Development Server

```bash
bun dev
```

Application runs at `http://localhost:3000`

### Run Tests

```bash
# All tests
bun test

# Contract tests only
bun test --grep "contract"

# Integration tests only
bun test --grep "integration"
```

### Database Management

```bash
# View database contents
bun run db:console

# Reset database (development only)
bun run db:reset
```

## Manual Testing Scenarios

### Scenario 1: Movie Browsing (Unauthenticated)

1. **Visit Homepage**

   - Navigate to `http://localhost:3000`
   - ✅ Verify: 20 movie cards displayed
   - ✅ Verify: Each card shows poster, title, year, rating
   - ✅ Verify: Rating buttons are disabled with "Coming in v2" tooltip

2. **Test Pagination**

   - Click "Next" or navigate to `/?page=2`
   - ✅ Verify: Different set of 20 movies loaded
   - ✅ Verify: Page indicator shows "Page 2 of 20"
   - ✅ Verify: Can navigate back to page 1

3. **Test Invalid Pages**
   - Navigate to `/?page=0`
   - ✅ Verify: Redirected to `/?page=1`
   - ✅ Verify: Notification "Redirected from invalid page" shown
   - Navigate to `/?page=21`
   - ✅ Verify: Same redirect behavior

### Scenario 2: User Registration

1. **Register New User**

   - Find login form in header
   - Enter unique username (e.g., "testuser123")
   - Submit form
   - ✅ Verify: Header updates to show "@testuser123" and logout button
   - ✅ Verify: Can continue browsing with persistent login

2. **Test Username Validation**
   - Try username "abc" (too short)
   - ✅ Verify: Error message "Username must be 4-30 characters"
   - Try username "test user" (contains space)
   - ✅ Verify: Error message about allowed characters
   - Try username "admin"
   - ✅ Verify: Error message about reserved username

### Scenario 3: User Login (Existing User)

1. **Login Existing User**
   - Logout if currently logged in
   - Enter previously registered username
   - Submit form
   - ✅ Verify: Header updates with username
   - ✅ Verify: No error messages displayed

### Scenario 4: Session Management

1. **Logout**

   - Click "Logout" button in header
   - ✅ Verify: Header returns to login form
   - ✅ Verify: Can continue browsing movies as unauthenticated user

2. **Session Persistence**
   - Login with username
   - Navigate to different pages
   - ✅ Verify: Username remains in header across page navigation
   - Refresh browser
   - ✅ Verify: Still logged in after refresh

### Scenario 5: Error Handling

1. **TMDB API Failure** (Requires mocking)

   - Temporarily break TMDB connection
   - Visit homepage
   - ✅ Verify: Redirected to error page
   - ✅ Verify: "Try Again" button works

2. **Network Issues**
   - Disconnect internet briefly
   - Try to navigate pages
   - ✅ Verify: Graceful error handling

## API Testing with curl

### Test Movie Browsing

```bash
# Get homepage
curl -H "Accept: text/html" http://localhost:3000/

# Get specific page
curl -H "Accept: text/html" http://localhost:3000/?page=2

# Test HTMX partial
curl -H "Accept: text/html" -H "HX-Request: true" http://localhost:3000/?page=2
```

### Test Authentication

```bash
# Login new user
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" \
     -H "HX-Request: true" \
     -d "username=testuser" \
     http://localhost:3000/login

# Logout
curl -X POST -H "HX-Request: true" \
     -b "auth_sid=session_id_here" \
     http://localhost:3000/logout
```

### Test Health Check

```bash
# Health status
curl -H "Accept: application/json" http://localhost:3000/healthz
```

## Performance Verification

### Page Load Times

- Homepage: < 200ms
- Page navigation: < 100ms
- HTMX swaps: < 100ms

### Measure with Browser DevTools

1. Open Chrome DevTools → Network tab
2. Navigate through application
3. Verify timing meets performance goals

## Troubleshooting

### Common Issues

**Movies not loading**:

- Check TMDB_TOKEN in .env file
- Verify TMDB API key is valid
- Check network connectivity

**Login not working**:

- Verify SESSION_SECRET is set
- Check database connection
- Look for validation errors in console

**Styles not applied**:

- Ensure TailwindCSS is built: `bunx tailwindcss -i ./src/styles.css -o ./public/styles.css`
- Check that Franken-UI classes are included

**Database errors**:

- Run `bun run db:migrate` to ensure schema is current
- Check database file permissions

### Debug Commands

```bash
# View application logs
bun dev --verbose

# Check database contents
sqlite3 database.db ".tables"
sqlite3 database.db "SELECT * FROM users;"

# Test TMDB connection
curl -H "Authorization: Bearer $TMDB_TOKEN" \
     "https://api.themoviedb.org/3/movie/top_rated?page=1"
```

## Acceptance Criteria Verification

After following this quickstart, verify these acceptance criteria:

- [x] `/?page=1` shows 20 movie cards with poster, title, year, rating
- [x] Pagination works for pages 1-20
- [x] Invalid `?page=0` redirects to page 1 with notification
- [x] Login with new username creates account and shows header update
- [x] Login with existing username authenticates and shows header update
- [x] Logout clears session and returns to login form
- [x] Movie cards show disabled rating buttons with "Coming in v2" tooltip
- [x] Session persists across page navigation
- [x] HTMX swaps update content without full page reload
- [x] Application follows TailwindCSS + Franken-UI styling
- [x] All functionality works in Bun runtime environment

## Next Steps

Once v1 is working:

1. Run `/tasks` command to generate implementation tasks
2. Follow task sequence for systematic development
3. Use this quickstart for manual validation of each implemented feature
