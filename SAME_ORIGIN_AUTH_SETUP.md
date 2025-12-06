# Same-Origin Authentication Setup

## Overview

The Sankat project now uses **Strategy A: Same-Origin Authentication** where the frontend and backend appear as a single origin. This eliminates all cross-origin cookie issues and makes authentication work seamlessly in localhost, ngrok, and production environments.

## How It Works

### Architecture

```
Browser → http://localhost:8080 (Vite Dev Server)
                    ↓
          Proxy: /api/* → http://localhost:8000 (FastAPI Backend)
```

The browser only communicates with `http://localhost:8080`. Vite's dev server:
1. Serves the React frontend
2. Proxies all `/api/*` requests to the backend on port 8000
3. Strips the `/api` prefix before forwarding

This makes the frontend and backend appear as **the same origin** to the browser.

## Changes Made

### 1. Vite Configuration (`vite.config.ts`)

Added proxy configuration:

```typescript
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // ...
}));
```

### 2. Backend CORS (`backend/app/main.py`)

Updated to only allow the frontend origin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Vite dev server with proxy
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Cookie Settings (`backend/app/auth.py`)

Already configured correctly for same-origin:

```python
response.set_cookie(
    key="auth_token",
    value=token,
    httponly=True,      # XSS protection
    secure=False,       # False for localhost (True for production HTTPS)
    samesite="lax",     # Universal for same-origin
    path="/",
)
```

### 4. Frontend API Calls

Updated all API calls to use relative URLs with `/api` prefix:

**Before:**
```typescript
fetch('http://localhost:8000/crises/')
```

**After:**
```typescript
fetch('/api/crises/', {
  credentials: 'include',  // Include cookies
})
```

Updated files:
- `src/lib/auth.ts` - Authentication API calls
- `src/lib/payments.ts` - Payment API calls
- `src/hooks/useCrises.ts` - Crisis data fetching

## Running the Application

### Development (Localhost)

1. **Start Backend:**
   ```bash
   cd backend
   ./start.sh
   # Backend runs on http://localhost:8000
   ```

2. **Start Frontend:**
   ```bash
   cd ..
   npm run dev
   # Frontend runs on http://localhost:8080
   ```

3. **Access the app:**
   - Open browser: `http://localhost:8080`
   - All requests to `/api/*` are proxied to the backend

### Sharing with ngrok

When you want to share your app publicly:

1. **Start both servers** (backend on 8000, frontend on 8080)

2. **Expose ONLY the frontend:**
   ```bash
   ngrok http 8080
   ```

3. **Access via ngrok URL:**
   ```
   https://abc123.ngrok-free.app
   ```

The ngrok URL becomes the new "same origin" for both frontend and backend (via proxy).

### Important: DO NOT expose backend directly

❌ **Don't do this:**
```bash
ngrok http 8000  # DON'T expose backend directly
```

✅ **Do this instead:**
```bash
ngrok http 8080  # Only expose frontend (which proxies to backend)
```

## Benefits

### ✅ Universal Authentication
- Same code works in localhost, ngrok, and production
- No SameSite=None complications
- No Secure attribute issues on localhost

### ✅ First-Party Cookies
- Cookies are always first-party (same origin)
- No browser blocking
- Works in all browsers and privacy modes

### ✅ Simplified Security
- SameSite=Lax works everywhere
- httpOnly cookies for XSS protection
- CSRF protection with double-submit cookies

### ✅ Easy Deployment
- Same configuration for all environments
- Just change `secure=True` for production HTTPS
- No CORS complications

## Production Deployment

For production, you'll typically:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Serve static files and proxy API requests using:
   - Nginx
   - Caddy
   - Vercel/Netlify (with proxy rules)

3. Update backend cookie settings:
   ```python
   secure=True  # Enable for HTTPS
   ```

Example Nginx config:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # Serve frontend
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to backend
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Cookies not being set

1. Check frontend is accessing via `http://localhost:8080` (not 8000)
2. Verify `credentials: 'include'` is in all fetch calls
3. Check browser DevTools → Application → Cookies

### API calls failing

1. Check browser Network tab - requests should go to `/api/*`
2. Verify backend is running on port 8000
3. Check Vite console for proxy errors

### CORS errors

If you see CORS errors:
1. Make sure you're accessing `http://localhost:8080` (not 5173 or 8000)
2. Verify backend CORS only allows `http://localhost:8080`
3. Restart Vite dev server after config changes

### ngrok authentication issues

1. Ensure you're exposing port 8080 (frontend), not 8000 (backend)
2. Both servers must be running
3. Clear browser cookies if switching between localhost and ngrok

## Testing Authentication

1. Go to `http://localhost:8080`
2. Click "Sign Up" or "Login"
3. Check DevTools → Application → Cookies
4. You should see:
   - `auth_token` (httpOnly)
   - `csrf_token` (readable by JS)
5. Make a donation - authentication should work seamlessly

## Summary

With Same-Origin Authentication:
- ✅ Frontend: `http://localhost:8080`
- ✅ Backend: Proxied via `/api` from port 8000
- ✅ Cookies: First-party, SameSite=Lax
- ✅ Works everywhere: localhost, ngrok, production
- ✅ No CORS complications
- ✅ No SameSite=None needed
- ✅ No Secure issues on localhost

Authentication is now universal! 🎉
