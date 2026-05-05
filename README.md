# insighta-portal

web portal for insighta labs+. a simple, functional interface for non-technical users to browse profiles, search, and manage their account.

built with next.js, typescript, and tailwind css.

## pages

- **login** — github oauth ("continue with github" button)
- **dashboard** — total profiles count, your role, recent profiles
- **profiles** — list with filters (gender, country, age group, sorting) and pagination
- **profile detail** — full profile info with delete button for admins
- **search** — natural language search ("young males from nigeria")
- **account** — your user info, role, and permissions

## auth

the portal uses http-only cookies for authentication. when you click "continue with github":

1. portal calls the backend to get a github auth url
2. your browser goes to github, you authorize
3. github redirects to the backend callback
4. backend sets http-only, secure, samesite=lax cookies with access_token and refresh_token
5. backend redirects you back to the portal

tokens never touch javascript — they're stored in cookies that the browser sends automatically. csrf protection comes from samesite=lax cookies.

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
