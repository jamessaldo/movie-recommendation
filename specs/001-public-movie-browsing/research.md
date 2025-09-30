# Research: Public Movie Browsing + Username Login

## Technology Stack Research

### Decision: Elysia.js + Bun Runtime

**Rationale**: Elysia.js is a fast, modern TypeScript web framework built specifically for Bun runtime. Provides excellent performance, type safety, and native support for modern web standards.

**Alternatives considered**:

- Express.js (too legacy, not optimized for Bun)
- Fastify (good performance but less Bun-native)
- Hono (good alternative but Elysia.js has better TypeScript integration)

### Decision: HTMX for Frontend Interactions

**Rationale**: HTMX allows server-side rendering with dynamic interactions without complex JavaScript frameworks. Perfect for PoC scope, maintains simplicity while enabling modern UX patterns.

**Alternatives considered**:

- React/Vue (violates constitution, over-engineered for PoC)
- Vanilla JavaScript (too much manual DOM manipulation)
- Alpine.js (good but HTMX better for server-side approach)

### Decision: SQLite for Data Persistence

**Rationale**: File-based database perfect for PoC. Zero configuration, ACID compliant, handles expected scale (minimal users, ~400 movies). Easy to backup and migrate.

**Alternatives considered**:

- PostgreSQL (over-engineered for PoC scope)
- MongoDB (NoSQL not needed for simple relational data)
- In-memory storage (data loss on restart not acceptable)

### Decision: TailwindCSS + Franken-UI Components

**Rationale**: Utility-first CSS framework with pre-built component library. Franken-UI provides consistent, accessible components that work well with HTMX. Rapid development with professional appearance.

**Alternatives considered**:

- Bootstrap (less flexible, more opinionated)
- Custom CSS (violates constitution, too much effort for PoC)
- Bulma (good but less ecosystem support)

## Integration Patterns Research

### Decision: TMDB API Integration with Bearer Token

**Rationale**: TMDB provides reliable movie data with good API structure. Bearer token authentication is simple and secure for PoC needs.

**Best practices**:

- Cache responses where possible
- Handle rate limits gracefully
- Use environment variables for API keys
- Implement retry logic for network failures

### Decision: Session-based Authentication with Signed Cookies

**Rationale**: Simple, secure session management. Signed cookies prevent tampering, 24-hour TTL balances security with user experience for PoC.

**Best practices**:

- Use cryptographically secure session IDs
- Store minimal session data in database
- Clear expired sessions regularly
- Use secure, httpOnly cookie flags

### Decision: Server-Side Rendering with HTMX Partials

**Rationale**: Reduces client-side complexity, improves SEO, faster initial page loads. HTMX enables dynamic updates without full page reloads.

**Best practices**:

- Use semantic HTML5 elements
- Implement progressive enhancement
- Minimize HTMX attributes complexity
- Clear loading states and error handling

## Performance Optimization Research

### Decision: Optimize for Development Speed over Performance

**Rationale**: PoC focus on functionality demonstration. Acceptable performance targets: <200ms page loads, <100ms HTMX swaps.

**Key optimizations**:

- Serve static assets efficiently
- Use SQLite indexes for user lookups
- Cache TMDB responses where appropriate
- Minimize bundle size with selective HTMX features

## Security Considerations Research

### Decision: Minimal Security for PoC Context

**Rationale**: Focus on core functionality, implement basic security hygiene without over-engineering.

**Security measures**:

- Input validation for usernames
- SQL injection prevention with parameterized queries
- CSRF protection for state-changing operations
- Secure session cookie configuration

**Not implemented** (out of PoC scope):

- Password-based authentication
- Rate limiting (beyond basic TMDB limits)
- Advanced CSRF tokens
- Content Security Policy headers
