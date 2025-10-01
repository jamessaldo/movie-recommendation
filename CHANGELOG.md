# Changelog

All notable changes to the Movie Rating PoC project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v2.0.0] - 2025-10-01

### Added

- **Local ratings system**: Users can rate movies 1-5 stars
- **Rating aggregates**: Average, count, and histogram visible on all movie cards
- **HTMX-powered interactions**: Rating submission without page refresh
- **Real-time stats updates**: Immediate feedback when ratings are submitted
- **Session-based authentication**: Maintain v1 24-hour session policy
- **Comprehensive error handling**: Session expiry, validation errors, unknown movies
- **Database schema**: New `ratings` table with proper constraints and indexes
- **Performance logging**: Rating events and stats query timing

### Enhanced

- **Movie cards**: Now include interactive rating controls and aggregate statistics
- **Template system**: Support for rating partials and out-of-band HTMX swaps
- **API endpoints**: Added `POST /rate` and `GET /stats/:movie_id`
- **Database migrations**: Extended migration system for v2 schema changes

### Technical Details

- **Architecture**: Single HTMX + Elysia.js application (no backend/frontend split)
- **Database**: SQLite with UPSERT pattern for one-rating-per-user-per-movie
- **Styling**: TailwindCSS + Franken-UI components
- **Runtime**: Bun v1.0+ for TypeScript execution
- **Dependencies**: Maintains v1 technology stack

### Functional Requirements Implemented

- FR-014: Logged-in users can submit 1-5 ratings
- FR-015: One rating per user per movie (with update capability)
- FR-016: Input validation with user-friendly error messages
- FR-017: Aggregate display in "Avg X.XX · N ratings" format
- FR-018: Rating histogram with counts for each 1-5 score
- FR-019: Disabled controls for logged-out users
- FR-020: Respect v1 session rules (24h TTL, no renewal)
- FR-021: Unknown movie ID handling
- FR-022: Visual feedback via star highlighting

## [v1.0.0] - 2025-09-30

### Added

- **Public movie browsing**: TMDB Top Rated movies with pagination
- **Username-only authentication**: Simple login/logout system
- **Session management**: 24-hour sessions without renewal
- **Responsive design**: TailwindCSS + Franken-UI styling
- **HTMX interactions**: Dynamic page updates without full refresh
- **Database foundation**: SQLite with users and sessions tables
- **Error handling**: TMDB API failures and invalid page navigation

### Technical Foundation

- **Elysia.js**: Web framework for TypeScript
- **HTMX**: Frontend interactivity without heavy JavaScript
- **SQLite**: Local database for user data
- **Bun**: JavaScript runtime and package manager
- **TailwindCSS + Franken-UI**: Consistent styling system
