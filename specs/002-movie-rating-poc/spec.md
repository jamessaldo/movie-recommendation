# Feature Specification: Movie Rating PoC v2

**Feature Branch**: `002-movie-rating-poc`  
**Created**: October 1, 2025  
**Status**: Draft  
**Input**: User description: "Movie Rating PoC v2 - Logged-in 1–5 rating for each movie + visible aggregates (count, average, histogram)"

## Execution Flow (main)

```
1. Parse user description from Input
   → Feature extends v1 with rating functionality
2. Extract key concepts from description
   → Actors: logged-in users, all visitors
   → Actions: rate movies, view aggregates
   → Data: user ratings, aggregate statistics
   → Constraints: 1-5 scale, one rating per user per movie
3. For each unclear aspect:
   → All aspects clearly defined in user requirements
4. Fill User Scenarios & Testing section
   → Clear user flows for rating and viewing aggregates
5. Generate Functional Requirements
   → Each requirement is testable and builds on v1
6. Identify Key Entities
   → Rating entity with user-movie relationship
7. Run Review Checklist
   → No implementation details, focused on business value
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-10-01

- Q: When a logged-in user rates a movie, what exact visual feedback should they see on the movie card? → A: Highlight/fill the selected star(s) in the rating controls
- Q: When a user's 24-hour session expires and they attempt to rate a movie, how should the system respond? → A: Show inline error message "Session expired, please log in" on the movie card then immediately refresh the page
- Q: When displaying rating aggregates on movie cards, should histogram bars with zero counts be shown or hidden? → A: Show zero bars but visually dimmed/grayed out
- Q: If a user attempts to rate a movie with an ID that hasn't been browsed/listed yet, how should the system handle this? → A: Reject with error "Movie not found"
- Q: What text format should be used to display rating aggregates on movie cards? → A: "Avg 3.87 · 142 ratings" (concise with bullet separator)

---

## User Scenarios & Testing

### Primary User Story

As a logged-in user, I want to rate movies on a 1-5 scale and see how my ratings contribute to visible community aggregates, so that I can express my opinion and understand community sentiment about each movie.

### Acceptance Scenarios

1. **Given** I am logged in and viewing a movie, **When** I select a rating from 1-5, **Then** my rating is saved, the selected stars are highlighted/filled, and updated community aggregates appear in "Avg X.XX · N ratings" format
2. **Given** I previously rated a movie, **When** I choose a different score, **Then** my rating updates and community aggregates reflect the change
3. **Given** I am logged out, **When** I view a movie card, **Then** rating controls are disabled with guidance to log in, while community aggregates remain visible
4. **Given** I am logged in, **When** I attempt to rate with invalid input, **Then** I see an error and no changes are applied
5. **Given** my session has expired, **When** I try to rate, **Then** I see "Session expired, please log in" message on the movie card and the page refreshes to update authentication state
6. **Given** multiple users have rated the same movie, **When** I view its aggregates, **Then** the average, count, and histogram accurately reflect all current ratings

### Edge Cases

- What happens when users rapidly click different rating values? The latest value should be stored
- How does system handle ratings for movies not yet browsed? System handles gracefully without breaking browsing experience
- What if movie metadata is missing? Rating capability and aggregates visibility are unaffected
- What happens when rating an unknown movie ID? System rejects with "Movie not found" error

## Requirements

### Functional Requirements

- **FR-014**: System MUST allow logged-in users to submit a rating of 1-5 for any movie
- **FR-015**: System MUST ensure at most one rating per user per movie; submitting another rating MUST update the prior rating
- **FR-016**: System MUST reject rating inputs outside 1-5 range and display an error without changing any stored values
- **FR-017**: System MUST compute and display per-movie average rating rounded to 2 decimal places and total count of local ratings in format "Avg X.XX · N ratings"
- **FR-018**: System MUST display a histogram showing counts for each rating value 1-5 for each movie's local ratings, with zero-count bars shown but visually dimmed/grayed out
- **FR-019**: System MUST show rating controls as disabled for logged-out visitors with guidance to log in to rate; aggregates remain visible to all visitors
- **FR-020**: System MUST respect session rules from v1 (24-hour lifetime, no renewal); attempts to rate with an expired session MUST show "Session expired, please log in" message and refresh the page
- **FR-021**: System MUST reject rating attempts for unknown movie IDs with "Movie not found" error
- **FR-022**: System MUST provide visual feedback by highlighting/filling selected stars when a user submits a rating

### Key Entities

- **Rating**: Represents a user's evaluation of a movie, containing user identifier, movie identifier, score (1-5), and timestamp information for creation and updates
- **User**: As defined in v1 (username-only accounts, 4-30 characters, alphanumeric plus underscore, case-sensitive)
- **Session**: As defined in v1 (24-hour lifetime, no automatic renewal) used to determine rating permission eligibility

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (no mentions of specific technologies or frameworks)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed
- [x] Scope stays within PoC boundaries (extends v1 movie browsing with rating functionality)

### Requirement Completeness

- [x] No unclear aspects remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable (average to 2dp, count, histogram values)
- [x] Scope is clearly bounded (rating and aggregates only, excludes admin features, external sync, etc.)
- [x] Dependencies and assumptions identified (builds on v1 user accounts and session management)

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none found)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
