# insighta-portal

web portal for insighta labs+. a simple, functional interface for non-technical users to browse profiles, search, and manage their account.

built with next.js, typescript, and tailwind css.

## pages

- **login** — github oauth ("continue with github" button, shows errors on failure)
- **dashboard** — total profiles count, recent profiles
- **profiles** — list with filters (gender, country, age group, sorting) and pagination
- **profile detail** — full profile info with delete button for admins
- **search** — natural language search ("young males from nigeria")
- **account** — your user info, role, and permissions

## auth flow

the portal uses a **bff (backend-for-frontend) proxy pattern**. the browser never calls the backend api directly — all requests go through next.js server-side api routes. this keeps tokens in http-only cookies that javascript can't read.

1. user clicks "continue with github"
2. browser navigates to `/api/auth/login` (server route) which redirects to the backend's github oauth url
3. backend handles the full oauth flow (generates pkce, redirects to github, handles callback, issues tokens)
4. backend redirects to `/api/auth/callback?code=ONE_TIME_CODE`
5. portal bff calls `POST /auth/exchange-code` server-to-server, gets the tokens
6. portal bff sets **http-only cookies**: `access_token` (3 min), `refresh_token` (5 min), and a `csrf_token` (5 min, not http-only)
7. browser redirects to `/dashboard`

### token storage

- tokens are stored in http-only, secure (prod), samesite=lax cookies
- javascript cannot read `access_token` or `refresh_token` — they're invisible to `document.cookie`
- the bff proxy reads cookies server-side (`request.cookies.get("access_token")`) and adds `authorization: bearer <token>` headers when calling the backend
- on 401, the bff transparently refreshes the token using the `refresh_token` cookie and retries the request

### csrf protection

the portal uses the **double-submit cookie** pattern:

1. on login, a `csrf_token` cookie is set (not http-only — javascript can read it)
2. client-side code reads the csrf token from `document.cookie` and sends it as `x-csrf-token` header on all post/delete requests
3. the bff proxy validates that the `x-csrf-token` header matches the `csrf_token` cookie
4. if they don't match → 403 forbidden

this works because an attacker's site can't read the csrf cookie (same-origin policy) and can't forge the custom header without it.

### server-side auth middleware

next.js middleware (`src/middleware.ts`) enforces authentication at the routing level:
- public paths (`/login`, `/api/auth/*`, static assets) are allowed without auth
- all other paths require the `access_token` cookie
- if missing, the middleware redirects to `/login` server-side before any html renders
- no "flash of unauthenticated content"

## role enforcement

- **admin**: sees "create profile" button, "delete" button on profile detail
- **analyst**: read-only — no create/delete buttons in the ui
- the backend enforces the same rules at the api level (403 for analysts attempting mutations)

## bff proxy routes

| route | methods | purpose |
|-------|---------|---------|
| `/api/auth/login` | GET | constructs backend oauth url server-side, redirects |
| `/api/auth/callback` | GET | handles oauth callback, exchanges code, sets cookies |
| `/api/auth/me` | GET | proxies `/auth/me`, handles token refresh |
| `/api/auth/logout` | POST | clears cookies, calls backend logout |
| `/api/proxy/[...path]` | GET, POST, DELETE | catch-all proxy for all profile api calls, adds auth headers, handles refresh, csrf validation on mutations |

## setup

```bash
npm install
```

create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```bash
npm run dev
```

## deployment

deployed on vercel. set `NEXT_PUBLIC_API_URL` to your backend url in the vercel environment variables.
