# Movie Rating PoC - Version 1

A movie browsing and rating proof-of-concept built with modern web technologies.

## 🎬 Features

**Version 1 - Public Movie Browsing:**

- ✅ Browse top-rated movies from TMDB (pages 1-20)
- ✅ Responsive movie grid layout with posters
- ✅ Username-based authentication (no passwords)
- ✅ Session management with 24-hour TTL
- ✅ Disabled rating buttons (preview for future versions)
- ✅ HTMX-powered dynamic interactions
- ✅ Error handling for TMDB API failures
- ✅ Page validation and flash messaging

## 🛠 Technology Stack

- **Runtime:** Bun v1.0+
- **Backend:** Elysia.js (TypeScript web framework)
- **Frontend:** HTMX for dynamic interactions
- **Styling:** TailwindCSS v4 with Franken-UI components
- **Database:** SQLite with custom migrations
- **API:** TMDB (The Movie Database) integration

## 📋 Prerequisites

- [Bun v1.0+](https://bun.sh/) installed
- TMDB API Bearer Token ([Get one here](https://www.themoviedb.org/settings/api))

## 🚀 Quick Start

1. **Clone and install dependencies:**

   ```bash
   cd movie-recommendation
   bun install
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your TMDB token
   ```

3. **Initialize database:**

   ```bash
   bun run migrate
   ```

4. **Build styles:**

   ```bash
   bun run build:css
   ```

5. **Start development server:**

   ```bash
   bun run dev
   ```

6. **Visit:** http://localhost:3000

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```bash
# TMDB API configuration
TMDB_TOKEN=your_tmdb_bearer_token_here

# Session configuration
SESSION_SECRET=your_32_char_session_secret_here

# Server configuration
PORT=3000
NODE_ENV=development
```

### TMDB API Token

1. Create account at [TheMovieDB.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request API key and choose "Developer"
4. Copy the "API Read Access Token" (Bearer Token)
5. Add to `.env` as `TMDB_TOKEN`

## 📁 Project Structure

```
movie-recommendation/
├── src/
│   ├── db/
│   │   ├── migrations/           # Database schema migrations
│   │   └── migrate.ts           # Migration runner
│   ├── routes/
│   │   ├── auth.ts              # Authentication controllers
│   │   └── movies.ts            # Movie browsing controllers
│   ├── services/
│   │   ├── db.ts                # Database service layer
│   │   ├── tmdb.ts              # TMDB API integration
│   │   └── template.ts          # Template rendering
│   ├── views/                   # HTML templates
│   │   ├── auth/                # Login/logout forms
│   │   ├── error/               # Error pages
│   │   ├── partials/            # Reusable components
│   │   ├── home.html            # Main movie grid
│   │   └── layout.html          # Base layout
│   ├── app.ts                   # Main Elysia.js application
│   └── styles.css               # TailwindCSS input
├── public/
│   └── styles.css               # Compiled CSS output
├── database.sqlite              # SQLite database (auto-created)
└── package.json
```

## 🎯 Available Scripts

```bash
# Development
bun run dev          # Start with auto-reload
bun run start        # Production start

# Database
bun run migrate      # Run database migrations

# Styling
bun run build:css    # Build TailwindCSS
bun run watch:css    # Watch mode for CSS
```

## 🗄 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🌐 API Endpoints

### Public Routes

- `GET /` - Movie grid homepage with pagination
- `GET /healthz` - Health check endpoint
- `GET /error/tmdb` - TMDB error fallback page

### Authentication Routes

- `POST /login` - Login or register new user
- `POST /logout` - End user session

### Query Parameters

- `?page=N` - Navigate movie pages (1-20)

## 🔐 Authentication Flow

1. **User enters username** (no password required)
2. **System creates user** if doesn't exist, or logs in existing
3. **Session created** with 24-hour TTL
4. **Session cookie set** with HttpOnly, SameSite protection
5. **Rating buttons disabled** (Version 1 limitation)

## 🎨 Styling System

### TailwindCSS v4 Configuration

- **Framework:** TailwindCSS v4 with CLI
- **Components:** Franken-UI component library
- **Build:** `bunx tailwindcss` CLI compilation
- **Output:** Single `public/styles.css` file

### Design Tokens

- **Colors:** Based on Franken-UI palette
- **Typography:** System font stack with fallbacks
- **Layout:** CSS Grid for movie displays
- **Responsive:** Mobile-first breakpoints

## 🚨 Error Handling

### TMDB API Failures

- **Detection:** Service-level error catching
- **Response:** Redirect to `/error/tmdb`
- **Recovery:** User can retry from error page
- **Fallback:** Graceful degradation with messaging

### Form Validation

- **Username:** Required, trimmed, case-sensitive
- **Sessions:** Auto-expiry with cleanup
- **Pages:** Range validation (1-20) with redirects

### Flash Messaging

- **Implementation:** Temporary cookies with 5-second TTL
- **Use cases:** Invalid page redirects, form feedback
- **Display:** Toast-style notifications in UI

## 🔄 Development Workflow

### Code Style

- **TypeScript:** Strict mode enabled
- **ESLint:** Standard configuration
- **Formatting:** Prettier integration
- **Imports:** Absolute paths from `src/`

### Testing Strategy

- **Manual:** Browser-based feature testing
- **Health checks:** `/healthz` endpoint monitoring
- **Error scenarios:** TMDB failures, invalid inputs
- **Session management:** Login/logout flows

## 🚀 Deployment

### Production Checklist

- [ ] Set strong `SESSION_SECRET` (32+ characters)
- [ ] Configure valid `TMDB_TOKEN`
- [ ] Set `NODE_ENV=production`
- [ ] Run database migrations
- [ ] Build production CSS
- [ ] Configure reverse proxy (nginx/cloudflare)
- [ ] Enable HTTPS
- [ ] Set up monitoring

### Environment Considerations

- **Port:** Configurable via `PORT` env var
- **Database:** SQLite file needs write permissions
- **Static assets:** Served from `public/` directory
- **Logging:** Console output for monitoring

## 🔮 Future Versions

**Version 2 - Movie Rating:**

- Enable rating buttons (1-5 stars)
- Persist user ratings to database
- Display user's previous ratings
- Rating statistics and averages

**Version 3 - Social Features:**

- User profiles and rating history
- Movie reviews and comments
- Rating leaderboards
- Social recommendations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow the established code style and structure
4. Test manually with different scenarios
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie data API
- [Elysia.js](https://elysiajs.com/) for the excellent TypeScript web framework
- [HTMX](https://htmx.org/) for modern HTML interactions
- [Franken-UI](https://www.franken-ui.dev/) for beautiful Tailwind components
- [Bun](https://bun.sh/) for the fast JavaScript runtime
