# Research: Movie Rating PoC v2

## HTMX Rating Interaction Patterns

**Decision**: Use form-based rating submission with HTMX partial swaps  
**Rationale**: HTMX excels at form handling and partial page updates. Rating buttons as form inputs with `hx-post` provide immediate feedback without full page refresh. Out-of-band swaps allow simultaneous update of rating controls and stats display.  
**Alternatives considered**: JavaScript click handlers (violates HTMX-first approach), full page refresh (poor UX)

## SQLite Upsert Strategy

**Decision**: Use `INSERT ... ON CONFLICT DO UPDATE` for rating upsert  
**Rationale**: SQLite supports UPSERT syntax for atomic one-rating-per-user-per-movie enforcement. Simpler than separate SELECT/INSERT/UPDATE logic and handles race conditions.  
**Alternatives considered**: Application-level upsert logic (race conditions), separate endpoints for create/update (complexity)

## Aggregate Calculation Performance

**Decision**: Real-time aggregate calculation on each rating submission  
**Rationale**: PoC scope (<400 movies max) allows real-time calculation. Simple SQL aggregation functions (COUNT, AVG, SUM) sufficient for immediate user feedback.  
**Alternatives considered**: Cached aggregates (premature optimization), background calculation (delayed feedback)

## Franken-UI Components for Rating Display

**Decision**: Use Franken-UI button variants for rating controls and badge components for histogram  
**Rationale**: Button components provide natural interaction patterns with hover/active states. Badge components ideal for compact count display in histogram. Maintains consistent design system.  
**Alternatives considered**: Custom star components (more complex), pure Tailwind utility classes (less consistent)

## Session Validation Strategy

**Decision**: Validate session on each rating request without TTL renewal  
**Rationale**: Maintains v1 session policy (24h no-renewal). Simple time comparison against current timestamp. Failed validation returns inline error partial.  
**Alternatives considered**: Automatic session renewal (violates v1 rules), redirect to login (disrupts HTMX flow)

## HTMX Target Strategy for Rating Updates

**Decision**: Dual-target approach with primary swap + out-of-band swap  
**Rationale**: Primary target updates stats block, out-of-band swap updates rating button visual state. Allows independent styling of rating controls while updating aggregates.  
**Alternatives considered**: Single target with full card refresh (inefficient), JavaScript for visual updates (violates HTMX approach)
