# Authentication API Contract

## POST /login

**Description**: User login/registration with username

**Request**:

```http
POST /login
Content-Type: application/x-www-form-urlencoded
HX-Request: true
HX-Target: auth-slot

username=john_doe
```

**Request Body**:

- `username`: string, 4-30 chars, alphanumeric + underscore, case-sensitive

**Success Response - New User (201)**:

```http
Content-Type: text/html
Set-Cookie: auth_sid={session_id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400

<div id="auth-slot">
  <span class="fui-text">@john_doe</span>
  <button class="fui-btn fui-btn-sm" hx-post="/logout" hx-target="#auth-slot">
    Logout
  </button>
</div>
```

**Success Response - Existing User (200)**:

```http
Content-Type: text/html
Set-Cookie: auth_sid={session_id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400

<div id="auth-slot">
  <span class="fui-text">@john_doe</span>
  <button class="fui-btn fui-btn-sm" hx-post="/logout" hx-target="#auth-slot">
    Logout
  </button>
</div>
```

**Validation Error Response (400)**:

```http
Content-Type: text/html

<div id="auth-slot">
  <form class="fui-form" hx-post="/login" hx-target="#auth-slot">
    <div class="fui-form-group">
      <label class="fui-label">Username</label>
      <input type="text" name="username" value="john_doe"
             class="fui-input fui-input-error" required>
      <div class="fui-error-message">Username must be 4-30 characters</div>
    </div>
    <button type="submit" class="fui-btn fui-btn-primary">Login</button>
  </form>
</div>
```

## POST /logout

**Description**: User logout and session termination

**Request**:

```http
POST /logout
Cookie: auth_sid={session_id}
HX-Request: true
HX-Target: auth-slot
```

**Success Response (200)**:

```http
Content-Type: text/html
Set-Cookie: auth_sid=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0

<div id="auth-slot">
  <form class="fui-form" hx-post="/login" hx-target="#auth-slot">
    <div class="fui-form-group">
      <label class="fui-label">Username</label>
      <input type="text" name="username" class="fui-input" required
             placeholder="Enter username">
    </div>
    <button type="submit" class="fui-btn fui-btn-primary">Login</button>
  </form>
</div>
```

**Unauthenticated Response (200)**:

```http
Content-Type: text/html

<div id="auth-slot">
  <form class="fui-form" hx-post="/login" hx-target="#auth-slot">
    <div class="fui-form-group">
      <label class="fui-label">Username</label>
      <input type="text" name="username" class="fui-input" required
             placeholder="Enter username">
    </div>
    <button type="submit" class="fui-btn fui-btn-primary">Login</button>
  </form>
</div>
```

## Authentication State Management

### Session Cookie Format

```
auth_sid={32-char-session-id}
Path=/
HttpOnly=true
Secure=true (production)
SameSite=Strict
Max-Age=86400 (24 hours)
```

### Session Validation Flow

1. Extract `auth_sid` cookie from request
2. Query sessions table for matching session ID
3. Check if session.expires_at > current time
4. If valid, load associated user data
5. If invalid, treat as unauthenticated

### Header State Rendering

```html
<!-- Unauthenticated state -->
<div id="auth-slot">
  <form class="fui-form" hx-post="/login" hx-target="#auth-slot">
    <div class="fui-form-group">
      <label class="fui-label">Username</label>
      <input type="text" name="username" class="fui-input" required />
    </div>
    <button type="submit" class="fui-btn fui-btn-primary">Login</button>
  </form>
</div>

<!-- Authenticated state -->
<div id="auth-slot">
  <span class="fui-text">@{username}</span>
  <button class="fui-btn fui-btn-sm" hx-post="/logout" hx-target="#auth-slot">
    Logout
  </button>
</div>
```

## Contract Tests Required

1. **test_login_new_user**:

   - POST /login with valid new username
   - Verify 201 response with auth header HTML
   - Verify session cookie set correctly
   - Verify user created in database

2. **test_login_existing_user**:

   - POST /login with existing username
   - Verify 200 response with auth header HTML
   - Verify new session created for existing user

3. **test_login_validation_errors**:

   - POST /login with invalid usernames (too short, too long, invalid chars)
   - Verify 400 response with error messages
   - Verify no session created

4. **test_login_reserved_usernames**:

   - POST /login with "admin", "root", "system"
   - Verify validation error returned

5. **test_logout_authenticated**:

   - POST /logout with valid session cookie
   - Verify 200 response with login form HTML
   - Verify session cookie cleared
   - Verify session invalidated in database

6. **test_logout_unauthenticated**:

   - POST /logout without session cookie
   - Verify 200 response with login form HTML

7. **test_session_expiration**:

   - Create session, wait 24+ hours (mock time)
   - Verify session no longer valid
   - Verify user treated as unauthenticated

8. **test_concurrent_sessions**:
   - Login from multiple "devices" (different session IDs)
   - Verify multiple sessions can exist for same user
   - Verify each session independent
