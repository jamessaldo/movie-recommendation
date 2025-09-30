# Health Check API Contract

## GET /healthz

**Description**: Health check endpoint for monitoring application status

**Request**:

```http
GET /healthz
Accept: application/json
```

**Success Response (200)**:

```http
Content-Type: application/json

{
  "ok": true,
  "timestamp": "2025-09-30T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "tmdb": "ok"
  }
}
```

**Service Degraded Response (200)**:

```http
Content-Type: application/json

{
  "ok": true,
  "timestamp": "2025-09-30T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "tmdb": "degraded"
  },
  "warnings": [
    "TMDB API response time elevated"
  ]
}
```

**Service Failure Response (503)**:

```http
Content-Type: application/json

{
  "ok": false,
  "timestamp": "2025-09-30T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": "error",
    "tmdb": "ok"
  },
  "errors": [
    "Database connection failed"
  ]
}
```

## Health Check Implementation

### Database Health Check

```typescript
async function checkDatabase(): Promise<ServiceStatus> {
  try {
    await db.query("SELECT 1");
    return { status: "ok" };
  } catch (error) {
    return {
      status: "error",
      message: "Database connection failed",
      error: error.message,
    };
  }
}
```

### TMDB Health Check

```typescript
async function checkTMDB(): Promise<ServiceStatus> {
  try {
    const start = Date.now();
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/top_rated?page=1",
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
        timeout: 5000,
      }
    );

    const duration = Date.now() - start;

    if (!response.ok) {
      return {
        status: "error",
        message: `TMDB API returned ${response.status}`,
      };
    }

    if (duration > 2000) {
      return {
        status: "degraded",
        message: `TMDB API slow (${duration}ms)`,
      };
    }

    return { status: "ok" };
  } catch (error) {
    return {
      status: "error",
      message: "TMDB API unavailable",
      error: error.message,
    };
  }
}
```

## Contract Tests Required

1. **test_health_check_all_ok**:

   - GET /healthz with all services healthy
   - Verify 200 response with ok=true
   - Verify all services status="ok"

2. **test_health_check_tmdb_degraded**:

   - Mock slow TMDB response (>2s)
   - GET /healthz
   - Verify 200 response with tmdb="degraded"
   - Verify warnings array includes TMDB message

3. **test_health_check_database_error**:

   - Mock database connection failure
   - GET /healthz
   - Verify 503 response with ok=false
   - Verify database="error" in services

4. **test_health_check_response_format**:
   - GET /healthz
   - Verify response includes all required fields
   - Verify timestamp is valid ISO string
   - Verify version matches package.json
