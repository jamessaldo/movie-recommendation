<!--
Sync Impact Report (2025-09-30):
- Version change: none → 1.0.0 (initial constitution)
- Modified principles: New constitution created
- Added sections: Core Principles, SOLID Principles, Technology Boundaries, Specification Rules, Planning Rules, Task Rules, Testing & Validation, Versioning & Scope, Styling Rules, Governance & Roles
- Removed sections: none
- Templates requiring updates:
  ✅ Updated constitution references in plan-template.md
  ✅ Updated constitution references in spec-template.md
  ✅ Updated constitution references in tasks-template.md
- Follow-up TODOs: none
-->

# Movie Rating PoC Constitution

## Core Principles

### I. Simplicity First

Clarity over cleverness in all code, documentation, and architecture decisions. Every solution must be the simplest that meets the requirements. Complex patterns MUST be justified against simpler alternatives. Favor readable code over performant code unless performance is explicitly required.

### II. Working Iterations

Favor small, working versions over speculative features. Each version MUST deliver a demoable, functional increment. No feature is considered complete until it works end-to-end in the browser. Incomplete features MUST NOT be merged.

### III. Consistency Enforcement

All versions MUST follow identical coding and styling rules. No exceptions for "quick fixes" or "temporary solutions." Code formatting, naming conventions, and file organization MUST be uniform across the entire codebase.

### IV. PoC Technology Demonstration

Primary goal is demonstrating HTMX + Elysia.js + SQLite + Franken-UI + Bun integration. Every feature MUST showcase at least one aspect of this stack. No alternative technologies unless explicitly justified for PoC demonstration purposes.

## SOLID Principles (Applied Lightly)

### Single Responsibility

Each module/file MUST serve only one purpose. Routes, database operations, and view logic MUST be separated into distinct files. No mixed concerns within a single function or class.

### Open/Closed Principle

Prefer small extensions (adding new endpoints or styles) over modifying existing logic heavily. New features MUST be additive rather than disruptive to existing functionality.

### Liskov Substitution

Write functions/components so they can be swapped with simpler/mock variants without breaking dependent code. Database helpers MUST be abstractable for testing.

### Interface Segregation

Keep types/contracts minimal and relevant. No unused properties in interfaces or database schemas. Each API endpoint MUST accept only the data it actually processes.

### Dependency Inversion

Depend on abstractions (helpers/interfaces), not hard-coded implementations. Use database helpers instead of raw SQL everywhere. Configuration MUST be externalized from business logic.

## Technology Boundaries

### In Scope

- **HTMX** for interactive UI swaps and form handling
- **TailwindCSS with Franken-UI** for all styling and UI components
- **Elysia.js** as the exclusive web server framework
- **SQLite** for all data persistence needs
- **Bun** as the JavaScript runtime and package manager
- **TMDB API (Top Rated Movies)** as the external data source

### Out of Scope

- Complex authentication providers (OAuth, SSO) - simple username/password only
- Production-grade infrastructure (Kubernetes, container orchestration, CDNs)
- Non-SQLite databases, Redis, message queues, or external caches
- Heavy frontend frameworks (React, Vue, Angular, or client-side routing)
- Third-party hosting services beyond basic deployment

## Specification Rules

### Required Sections

`/specify` documents MUST include:

- Clear user stories in plain language understandable by non-technical stakeholders
- Explicit scope and out-of-scope lists for each version
- Always tied to a single, specific version increment
- Acceptance criteria that can be manually tested in a browser

### Prohibited Content

- Implementation details (no mentions of specific files, databases, or code structure)
- Technology choices (leave to planning phase)
- Cross-version dependencies or future roadmap speculation

## Planning Rules

### Required Content

`/plan` documents MUST describe:

- Specific routes & HTTP endpoints with request/response examples
- Database schema changes (new tables or column additions)
- HTMX interaction patterns (triggers, targets, swaps)
- Specific Franken-UI components to be implemented
- Bun/Elysia.js integration and startup configuration

### Size Limits

- Maximum 2 pages per version plan
- Focus on technical decisions, not implementation details
- Include only information needed for task generation

## Task Rules

### Task Count and Structure

`/tasks` documents MUST contain:

- Between 5-12 atomic, independent tasks maximum
- Each task includes "Done when..." criteria and manual validation steps
- Styling tasks MUST reference specific Franken-UI utilities/components
- Backend tasks MUST assume Bun runtime (`bun run`, `bun dev`, Bun APIs)

### Task Dependencies

- Test tasks MUST come before implementation tasks (TDD required)
- Database tasks MUST precede application logic tasks
- HTMX integration tasks MUST follow backend API tasks

## Testing & Validation

### Required Testing

Only happy-path verification required:

- All routes respond with expected HTTP status codes
- Database updates occur as expected (verify with SQL queries)
- HTMX swaps trigger and update correct DOM elements
- Franken-UI components render as intended in browser
- Bun development commands execute successfully (`bun dev`, `bun run`)

### Optional Testing

- Automated test suites are optional for PoC
- Error handling testing is optional unless explicitly required
- Performance testing beyond basic functionality is not required

## Versioning & Scope

### Version Constraints

- Each version MUST deliver a minimal, demoable feature
- Scope creep within a version is strictly prohibited
- Maximum scope boundaries: browse up to page 20 of movies, simple username login, 1-5 star rating system, basic admin dashboard

### Version Increment Rules

- New feature = minor version bump (0.1.0 → 0.2.0)
- Bug fixes or styling improvements = patch version bump (0.1.0 → 0.1.1)
- Major architectural changes = major version bump (rare for PoC)

## Styling Rules

### Framework Usage

- TailwindCSS with Franken-UI components MUST be used consistently
- No custom CSS files unless absolutely necessary for PoC demonstration
- All styling MUST be utility-first with Tailwind classes

### Layout Requirements

- Minimal, responsive layout supporting desktop and mobile
- Movie grid display with consistent card formatting
- Compact admin tables with clear data presentation
- Loading states and empty states MUST use Franken-UI patterns

## Governance & Roles

### Development Workflow

- **Spec Author**: Creates `/specify` documents following specification rules
- **Planner**: Expands specifications into `/plan` documents with technical details
- **Task Creator**: Breaks plans into atomic `/tasks` following task rules
- **Implementer**: Follows constitution rules with Bun as runtime baseline

### Amendment Process

- Constitution changes require version bump (MAJOR for principle changes, MINOR for new sections, PATCH for clarifications)
- All amendments MUST update this document and propagate to dependent templates
- No constitutional exceptions without documented justification

### Compliance Enforcement

- Every plan and task MUST reference constitution compliance
- Violations require explicit documentation and simpler alternative justification
- Constitution supersedes all other practices and preferences

**Version**: 1.0.0 | **Ratified**: 2025-09-30 | **Last Amended**: 2025-09-30
