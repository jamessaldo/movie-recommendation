# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize Bun project with Elysia.js dependencies
- [ ] T003 [P] Configure TailwindCSS with Franken-UI components

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T004 [P] Contract test POST /api/movies in tests/contract/test_movies_post.ts
- [ ] T005 [P] Contract test GET /api/movies in tests/contract/test_movies_get.ts
- [ ] T006 [P] Integration test movie rating flow in tests/integration/test_rating.ts
- [ ] T007 [P] Integration test HTMX movie grid in tests/integration/test_movie_grid.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T008 [P] Movie model with SQLite schema in src/models/movie.ts
- [ ] T009 [P] MovieService with TMDB integration in src/services/movie_service.ts
- [ ] T010 [P] HTMX movie grid component in src/views/movie_grid.html
- [ ] T011 GET /api/movies endpoint with Elysia.js
- [ ] T012 POST /api/movies/rate endpoint
- [ ] T013 Movie data validation with Bun runtime
- [ ] T014 Error handling and HTMX response formatting

## Phase 3.4: Integration

- [ ] T015 Connect MovieService to SQLite database
- [ ] T016 HTMX interaction handlers and CSRF protection
- [ ] T017 Request/response logging with Bun
- [ ] T018 Franken-UI component styling and responsive layout

## Phase 3.5: Polish

- [ ] T019 [P] Unit tests for rating validation in tests/unit/test_rating_validation.ts
- [ ] T020 Manual testing with browser verification
- [ ] T021 [P] Update docs/movie-api.md
- [ ] T022 Code cleanup and SOLID principles compliance
- [ ] T023 Run browser testing checklist

## Dependencies

- Tests (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)
- SQLite schema (T008) before service layer (T009)
- HTMX components (T010) before styling (T018)

## Parallel Example

```
# Launch T004-T007 together:
Task: "Contract test POST /api/movies in tests/contract/test_movies_post.ts"
Task: "Contract test GET /api/movies in tests/contract/test_movies_get.ts"
Task: "Integration test rating flow in tests/integration/test_rating.ts"
Task: "Integration test HTMX grid in tests/integration/test_movie_grid.ts"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:

   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All API contracts have corresponding tests
- [ ] All data models have SQLite schema tasks
- [ ] All tests come before implementation (TDD)
- [ ] Parallel tasks truly independent (different files)
- [ ] Each task specifies exact file path with .ts extension
- [ ] No task modifies same file as another [P] task
- [ ] HTMX interactions have integration tests
- [ ] Franken-UI components specified in styling tasks
