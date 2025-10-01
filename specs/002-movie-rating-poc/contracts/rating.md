# Rating API Contract

## POST /rate

**Purpose**: Submit or update a user's rating for a movie

### Request

**Authentication**: Required (valid session cookie)

**Headers**:

```
Content-Type: application/x-www-form-urlencoded
Cookie: auth_sid={session_id}
```

**Body Parameters**:

- `movie_id` (integer, required): TMDB movie identifier (positive integer)
- `score` (integer, required): Rating value (1, 2, 3, 4, or 5)

**Example**:

```
movie_id=123&score=4
```

### Response

#### Success (200 OK)

**Content-Type**: `text/html` (HTMX partial)

**Body**: HTML partial containing:

1. Updated stats block for the movie (`id="stats-{movie_id}"`)
2. Out-of-band rating controls update (`id="rating-{movie_id}"` with `hx-swap-oob="true"`)

**Example**:

```html
<div id="stats-123" class="text-sm text-gray-600">
  <div>Your rating: 4★</div>
  <div>Avg 3.87 · 142 ratings</div>
  <div class="histogram">1★(5) 2★(12) 3★(34) 4★(56) 5★(35)</div>
</div>

<div id="rating-123" hx-swap-oob="true" class="rating-controls">
  <!-- Updated rating buttons with new active state -->
</div>
```

#### Validation Error (422 Unprocessable Entity)

**Content-Type**: `text/html` (HTMX partial)

**Body**: Error alert partial

**Example**:

```html
<div class="alert alert-danger">Invalid rating. Please select 1-5 stars.</div>
```

#### Authentication Error (401 Unauthorized)

**Content-Type**: `text/html` (HTMX partial)

**Body**: Session expired alert partial

**Example**:

```html
<div class="alert alert-warning">Session expired, please log in</div>
```

#### Movie Not Found (404 Not Found)

**Content-Type**: `text/html` (HTMX partial)

**Body**: Movie not found error partial

**Example**:

```html
<div class="alert alert-danger">Movie not found</div>
```

## GET /stats/:movie_id

**Purpose**: Retrieve current rating statistics for a movie

### Request

**Authentication**: Optional (stats visible to all users)

**Path Parameters**:

- `movie_id` (integer, required): TMDB movie identifier

**Example**: `GET /stats/123`

### Response

#### Success (200 OK)

**Content-Type**: `text/html` (HTMX partial)

**Body**: Stats block HTML partial (same format as POST /rate response)

**Example**:

```html
<div id="stats-123" class="text-sm text-gray-600">
  <div>Your rating: 4★</div>
  <!-- Only if user is logged in and has rated -->
  <div>Avg 3.87 · 142 ratings</div>
  <div class="histogram">1★(5) 2★(12) 3★(34) 4★(56) 5★(35)</div>
</div>
```

#### No Ratings (200 OK)

**Content-Type**: `text/html` (HTMX partial)

**Body**: Empty stats or "No ratings yet" message

**Example**:

```html
<div id="stats-123" class="text-sm text-gray-500">No ratings yet</div>
```

## HTMX Integration

### Rating Form Pattern

```html
<form hx-post="/rate" hx-target="#stats-{movie_id}" hx-swap="outerHTML">
  <input type="hidden" name="movie_id" value="{movie_id}" />
  <button type="submit" name="score" value="1">
    <uk-icon icon="star"></uk-icon>
  </button>
  <button type="submit" name="score" value="2">
    <uk-icon icon="star"></uk-icon>
  </button>
  <button type="submit" name="score" value="3">
    <uk-icon icon="star"></uk-icon>
  </button>
  <button type="submit" name="score" value="4">
    <uk-icon icon="star"></uk-icon>
  </button>
  <button type="submit" name="score" value="5">
    <uk-icon icon="star"></uk-icon>
  </button>
</form>
```

### Stats Refresh Pattern

```html
<div
  hx-get="/stats/{movie_id}"
  hx-target="#stats-{movie_id}"
  hx-swap="outerHTML"
>
  <!-- Current stats content -->
</div>
```
