# Movies API Contract

## GET /

**Description**: Homepage with movie grid and pagination

**Request**:

```http
GET /?page={page}
Accept: text/html
```

**Query Parameters**:

- `page` (optional): integer, 1-20, default 1

**Success Response (200)**:

```http
Content-Type: text/html

<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <nav id="navbar">
    <div id="auth-slot">
      <!-- Login form or user info -->
    </div>
  </nav>

  <main>
    <div id="movie-grid">
      <!-- 20 movie cards -->
    </div>

    <nav id="pagination">
      <!-- Previous/Next links -->
    </nav>
  </main>
</body>
</html>
```

**Invalid Page Response (302)**:

```http
Location: /?page=1
Set-Cookie: flash=Redirected from invalid page; Path=/; HttpOnly
```

**TMDB Error Response (302)**:

```http
Location: /error/tmdb
```

## GET /error/tmdb

**Description**: Error page when TMDB API is unavailable

**Request**:

```http
GET /error/tmdb
Accept: text/html
```

**Response (200)**:

```http
Content-Type: text/html

<!DOCTYPE html>
<html>
<body>
  <div class="error-page">
    <h1>Movies Temporarily Unavailable</h1>
    <p>We're having trouble loading movies right now.</p>
    <button hx-get="/" hx-target="body">Try Again</button>
  </div>
</body>
</html>
```

## HTMX Partial: Movie Grid

**Description**: HTMX partial for updating movie grid

**Request**:

```http
GET /?page={page}
Accept: text/html
HX-Request: true
HX-Target: movie-grid
```

**Response (200)**:

```html
<div
  id="movie-grid"
  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
>
  <!-- Movie card template repeated 20 times -->
  <div class="fui-card">
    <img
      src="https://image.tmdb.org/t/p/w342{poster_path}"
      alt="{title}"
      class="w-full"
    />
    <div class="fui-card-body">
      <h3 class="fui-card-title">{title}</h3>
      <p class="text-sm text-gray-600">{release_year}</p>
      <div class="flex items-center gap-2">
        <span class="fui-badge">★ {vote_average}</span>
        <div class="fui-btn-group">
          <button class="fui-btn fui-btn-sm" disabled title="Coming in v2">
            ☆☆☆☆☆
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Pagination controls -->
<nav class="fui-pagination" id="pagination">
  <a
    href="/?page={prev}"
    hx-get="/?page={prev}"
    hx-target="#movie-grid"
    class="fui-btn fui-btn-outline"
    >Previous</a
  >
  <span class="fui-pagination-info">Page {current} of 20</span>
  <a
    href="/?page={next}"
    hx-get="/?page={next}"
    hx-target="#movie-grid"
    class="fui-btn fui-btn-outline"
    >Next</a
  >
</nav>
```

## Contract Tests Required

1. **test_homepage_default_page**:

   - GET / → 200 with movie grid
   - Verify 20 movie cards present
   - Verify pagination controls

2. **test_homepage_with_page**:

   - GET /?page=2 → 200 with different movies
   - Verify page 2 content differs from page 1

3. **test_invalid_page_redirect**:

   - GET /?page=0 → 302 to /?page=1
   - GET /?page=21 → 302 to /?page=1
   - Verify flash message set

4. **test_htmx_movie_grid_partial**:

   - GET /?page=2 with HX-Request header
   - Verify response contains only grid HTML
   - Verify pagination updates

5. **test_tmdb_error_handling**:
   - Mock TMDB API failure
   - GET / → 302 to /error/tmdb
   - GET /error/tmdb → 200 with error page
