# Quickstart: Movie Rating PoC v2

## Setup & Run

```bash
# Install dependencies
bun install

# Run database migrations
bun run migrate

# Start development server
bun run dev

# Open browser
open http://localhost:3000
```

## Manual Validation Steps

### 1. Browse Movies (v1 functionality)

- [ ] Visit http://localhost:3000
- [ ] Verify movie grid displays 20 movies per page
- [ ] Navigate to page 2, verify different movies shown
- [ ] Try invalid page (e.g., page 25), verify redirect to page 1 with notice

### 2. User Authentication (v1 functionality)

- [ ] Click "Login" link
- [ ] Create account with username "testuser" (4-30 chars, alphanumeric + underscore)
- [ ] Verify login success and username appears in navigation
- [ ] Logout and login again to verify session persistence

### 3. Rating Controls Display (v2 NEW)

- [ ] **Logged out**: Verify rating controls show 1-5 buttons but are disabled with "Login to rate" tooltip
- [ ] **Logged in**: Verify rating controls show 1-5 clickable buttons
- [ ] Verify rating controls appear on all movie cards

### 4. Rating Submission (v2 NEW)

- [ ] **Logged in**: Click 3★ button on first movie
- [ ] Verify immediate response: selected button highlights, stats update
- [ ] Verify "Your rating: 3★" appears on the card
- [ ] Verify aggregate stats show (e.g., "Avg 3.00 · 1 rating")
- [ ] Verify histogram shows "3★(1)" and other values as "(0)" but dimmed

### 5. Rating Updates (v2 NEW)

- [ ] Click 5★ button on same movie
- [ ] Verify "Your rating: 5★" updates immediately
- [ ] Verify aggregate stats update (e.g., "Avg 5.00 · 1 rating")
- [ ] Verify histogram updates to show "5★(1)" and "3★(0)"

### 6. Multiple User Ratings (v2 NEW)

- [ ] Logout and create second account "testuser2"
- [ ] Rate same movie 2★
- [ ] Verify aggregates show combined stats (e.g., "Avg 3.50 · 2 ratings")
- [ ] Verify histogram shows both ratings: "2★(1)" and "5★(1)"
- [ ] Verify "Your rating: 2★" shows for current user

### 7. Error Handling (v2 NEW)

- [ ] **Session Expiry**: Manually expire session in database, try to rate
- [ ] Verify "Session expired, please log in" message appears and page refreshes
- [ ] **Invalid Input**: Use browser dev tools to submit score=0 or score=7
- [ ] Verify error message appears, no database changes occur

### 8. Aggregate Display Format (v2 NEW)

- [ ] Verify aggregate text follows format: "Avg X.XX · N ratings"
- [ ] Verify average shows exactly 2 decimal places (e.g., 3.50 not 3.5)
- [ ] Verify histogram shows all 1-5 values, with zero counts dimmed/grayed
- [ ] Verify "Your rating: X★" appears only for logged-in users who have rated

### 9. Cross-Page Consistency (v2 NEW)

- [ ] Rate a movie on page 1
- [ ] Navigate to page 2 and back to page 1
- [ ] Verify rating and stats persist correctly
- [ ] Rate another movie, navigate away and back
- [ ] Verify all previous ratings remain visible

### 10. Logged-out Experience (v2 NEW)

- [ ] Logout completely
- [ ] Verify all rating controls show as disabled
- [ ] Verify all aggregate stats remain visible
- [ ] Verify "Login to rate" guidance appears on hover/click
- [ ] Verify no "Your rating" text appears anywhere

## Database Verification

### Check Rating Storage

```sql
-- Verify rating was stored correctly
SELECT * FROM ratings ORDER BY created_at DESC LIMIT 10;

-- Verify unique constraint (one rating per user per movie)
SELECT movie_id, user_id, COUNT(*) FROM ratings GROUP BY movie_id, user_id HAVING COUNT(*) > 1;

-- Verify score constraints (should be empty)
SELECT * FROM ratings WHERE score < 1 OR score > 5;
```

### Check Aggregate Calculations

```sql
-- Verify aggregate calculations for specific movie
SELECT
  COUNT(*) as count,
  ROUND(AVG(score), 2) as avg,
  SUM(score = 1) as h1,
  SUM(score = 2) as h2,
  SUM(score = 3) as h3,
  SUM(score = 4) as h4,
  SUM(score = 5) as h5
FROM ratings
WHERE movie_id = 123; -- Replace with actual movie ID
```

## Performance Check

### Response Times (PoC Expectations)

- [ ] Rating submission responds within 1 second
- [ ] Stats updates appear immediately (< 500ms)
- [ ] Page navigation remains fast with rating data loaded
- [ ] No noticeable lag when clicking rating buttons

### HTMX Validation

- [ ] Rating submission does not cause full page refresh
- [ ] Only stats block and rating controls update after rating
- [ ] Network tab shows POST /rate requests return HTML partials
- [ ] Out-of-band swaps update rating button visual state correctly

## Success Criteria

✅ **All validation steps pass**  
✅ **Database constraints enforced**  
✅ **HTMX interactions work correctly**  
✅ **Rating aggregates calculate accurately**  
✅ **v1 functionality unchanged**  
✅ **Error handling provides clear feedback**
