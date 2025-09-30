# Implementation Plan: Public Movie Browsing + Username Login

**Branch**: `001-public-movie-browsing` | **Date**: 2025-09-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-public-movie-browsing/spec.md`

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

Build a movie browsing web application with TMDB Top Rated Movies (pages 1-20, 20 movies per page) and simple username-based authentication. Users can browse movies without login, register/login with username only, and see disabled rating buttons as preview for v2. Stack: HTMX + Elysia.js + SQLite + TailwindCSS (Franken-UI) + Bun runtime.

## Technical Context

**Language/Version**: TypeScript with Bun v1.0+ as JavaScript runtime  
**Primary Dependencies**: Elysia.js (web framework), HTMX (frontend interactions), TailwindCSS with Franken-UI (styling)  
**Storage**: SQLite database for users and sessions  
**Testing**: Bun test runner for unit and integration tests  
**Target Platform**: Web application (server-side rendered with HTMX)  
**Project Type**: web - single-page application with server-side rendering  
**Performance Goals**: <200ms page load, <100ms HTMX swaps, TMDB API calls <500ms  
**Constraints**: PoC scope only, pages 1-20 limit, 24-hour session TTL, case-sensitive usernames  
**Scale/Scope**: Single-user PoC, ~400 total movies (20 pages × 20 movies), minimal concurrent users

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Technology Stack Compliance**:

- [x] Uses HTMX for UI interactions (no React/Vue/Angular)
- [x] Uses Elysia.js as web server framework
- [x] Uses SQLite for data persistence (no external databases)
- [x] Uses TailwindCSS with Franken-UI for styling (no custom CSS unless justified)
- [x] Uses Bun as JavaScript runtime and package manager

**Simplicity & Scope**:

- [x] Feature delivers single, demoable increment
- [x] No speculative or future-oriented features
- [x] Clear separation of routes, database, and view logic
- [x] Maximum scope stays within PoC boundaries (browse movies, simple auth, rating, admin)

**SOLID Principles (Light Application)**:

- [x] Single responsibility: separate files for routes, DB, views
- [x] Open/closed: additive changes, not disruptive modifications
- [x] Interface segregation: minimal, relevant contracts only
- [x] Dependency inversion: use abstractions/helpers, not hard-coded implementations

## Project Structure

### Documentation (this feature)

```
specs/001-public-movie-browsing/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
src/
├── routes/              # Elysia.js route handlers
│   ├── movies.ts        # Movie browsing endpoints
│   ├── auth.ts          # Login/logout endpoints
│   └── health.ts        # Health check endpoint
├── models/              # Data models and DB schemas
│   ├── user.ts          # User entity and validation
│   ├── session.ts       # Session management
│   └── movie.ts         # Movie data types
├── services/            # Business logic layer
│   ├── tmdb.ts          # TMDB API integration
│   ├── auth.ts          # Authentication service
│   └── db.ts            # Database connection and queries
├── views/               # HTML templates and partials
│   ├── layout.html      # Base layout with HTMX
│   ├── movies/          # Movie-related templates
│   │   ├── grid.html    # Movie grid component
│   │   └── card.html    # Individual movie card
│   ├── auth/            # Authentication templates
│   │   ├── login.html   # Login form
│   │   └── header.html  # Header with user status
│   └── error.html       # Error pages
├── lib/                 # Shared utilities
│   ├── validation.ts    # Input validation helpers
│   └── utils.ts         # General utilities
└── app.ts               # Main Elysia application setup

tests/
├── contract/            # API contract tests
│   ├── movies.test.ts   # Movie endpoint tests
│   └── auth.test.ts     # Auth endpoint tests
├── integration/         # End-to-end tests
│   ├── movie-browsing.test.ts
│   └── auth-flow.test.ts
└── unit/                # Unit tests
    ├── services/        # Service layer tests
    └── lib/             # Utility function tests

public/                  # Static assets
├── styles.css           # Compiled TailwindCSS
└── htmx.min.js          # HTMX library

package.json             # Bun project configuration
tailwind.config.js       # TailwindCSS + Franken-UI config
tsconfig.json           # TypeScript configuration
database.db             # SQLite database file
```

**Structure Decision**: Web application structure selected. Single codebase with TypeScript + Bun, server-side rendering with HTMX, and SQLite database. Clear separation of routes, services, models, and views following SOLID principles.

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

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations detected. All requirements align with established principles._

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
- [x] Complexity deviations documented

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
