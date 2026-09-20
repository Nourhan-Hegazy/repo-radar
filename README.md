# Repo Radar

A dashboard for searching GitHub repositories, tracking favourites, and monitoring
their latest stats.

**Live demo:** https://YOUR-APP.vercel.app
**Repository:** https://github.com/Nourhan-Hegazy/repo-radar

---

## Tech stack

| Concern          | Choice                              |
| ---------------- | ----------------------------------- |
| Framework        | React 19 + TypeScript               |
| Build tool       | Vite                                |
| State management | Zustand (with `persist` middleware) |
| UI components    | MUI (Material UI)                   |
| Charts           | MUI X Charts                        |
| Data source      | GitHub REST API (`api.github.com`)  |
| Hosting          | Vercel                              |

---

## Setup

```bash
git clone https://github.com/YOUR-USERNAME/repo-radar.git
cd repo-radar
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

```bash
npm run build     # type-check + production build
npm run preview   # serve the production build locally
npm run lint      # ESLint
```

No environment variables are required — the app uses the unauthenticated GitHub API.

---

## Features

- Debounced repository search (400 ms)
- Track / untrack repositories
- Dedicated Tracked Repos view
- Stars, open issues and last commit date per repository
- Refresh a single repository or all tracked repositories
- Independent loading and error state for every tracked repository
- Tracked repositories persisted to `localStorage`
- Bar chart of stars across tracked repositories
- Fully typed — no `any` in application code

---

## Architecture

```
src/
├── types.ts              Shared TypeScript types
├── api.ts                GitHub REST calls + HTTP error translation
├── store.ts              Zustand store: tracking, persistence, refresh
├── useDebounce.ts        Debounce hook
├── RepoCard.tsx          Search result + track toggle
├── TrackedRepoCard.tsx   Tracked repo: own stats, loading and error state
├── TrackedList.tsx       Tracked view + "Refresh all"
├── StarsChart.tsx        Bar chart derived from the store
├── App.tsx               Tabs, search state, layout
└── main.tsx              Entry point, theme, CssBaseline
```

**Layering rule:** `api.ts` contains no React. Components contain no `fetch`.
The store is the only bridge between them. This keeps the data layer independently
reusable and testable.

**Structure is deliberately flat.** With one store and eight components, nested
feature folders would add navigation cost without adding clarity. The structure is
sized to the app.

---

## Technical decisions

### Zustand over Redux Toolkit

The app has one domain (tracked repositories) and four actions. RTK's slices,
reducers and middleware would add boilerplate without solving a problem this app
has. Zustand also ships `persist`, which covers the localStorage requirement
directly. RTK Query would be the stronger choice if the app grew a real caching
layer across many endpoints.

### Separating user intent from server data

The store holds two distinct things:

```ts
trackedNames: string[]                     // persisted
repoData: Record<string, RepoState>        // never persisted
```

`trackedNames` is **user intent** — small, stable, safe to persist.
`repoData` is **server truth** — star counts and issue counts go stale within
minutes, so caching them would show users incorrect numbers on load.

`partialize` therefore writes only `trackedNames` to localStorage, and the app
refetches all stats on mount. The API remains the source of truth for data;
localStorage only remembers what the user chose.

### Normalized state keyed by full name

`repoData` is a `Record<string, RepoState>` rather than an array:

- O(1) lookup and update by repository
- Updating one repository cannot touch another
- Duplicates are impossible by construction

`trackedNames` preserves display order; the record holds the data.

### Per-repository async state

There is no global `isLoading` flag anywhere in the app. Each entry carries its
own `status` and `error`:

```ts
interface RepoState {
  status: "idle" | "loading" | "success" | "error";
  error: string;
  repo: GitHubRepo | null;
}
```

Each card subscribes only to its own slice via a Zustand selector, so refreshing
one repository re-renders exactly one card. The requirement for independent
loading and error states is satisfied by the _shape of the state_, not by extra
UI logic.

A failed refresh keeps the previously fetched data visible alongside the error,
so a transient failure does not blank the card.

### Derived state over stored state

Values that can be computed are computed, never stored:

- The chart is a pure projection of the store — it holds no state
- "Is anything refreshing?" is derived from the per-repo statuses
- The search idle state is derived from the query length

This removes an entire class of synchronisation bugs.

### `Promise.allSettled` for "Refresh all"

Refreshes run in parallel and are collected with `allSettled`, so one failing
repository (deleted, renamed, rate-limited) cannot abort the batch. `Promise.all`
would reject on the first failure and leave the rest in an indeterminate state.

### Last commit date via `pushed_at`

`GET /repos/{owner}/{repo}` returns `pushed_at` in the same response as stars and
open issues. Using `GET /commits?per_page=1` would give the exact last commit on
the default branch but would double the number of requests per refresh, against a
60 requests/hour unauthenticated budget.

`pushed_at` reflects a push to _any_ branch, which is a small accuracy trade-off
accepted in exchange for halving API usage. The UI labels it "Updated" rather than
"Last commit" to stay honest about what is displayed.

### Stale-response handling

Each search effect uses a `cancelled` flag in its cleanup function, so a slow
response from an earlier query cannot overwrite results from a newer one.
`AbortController` would additionally cancel the in-flight request; the flag was
chosen for simplicity, and the user-visible behaviour is identical.

### Centralised error translation

All HTTP error handling lives in `api.ts`. `fetch` does not reject on 4xx/5xx
responses, so `res.ok` is checked explicitly and status codes are converted into
user-facing messages (403/429 → rate limit, 404 → not found) in one place.
Components display `error.message` without knowing anything about HTTP.

---

## Assumptions and limitations

- **Unauthenticated API.** Limits are 10 search requests/minute and 60 core
  requests/hour per IP. A token was deliberately not used: any token shipped in a
  frontend bundle is publicly readable. A production version would proxy requests
  through a small backend that holds the token server-side.
- **Rate limiting is surfaced, not avoided.** The 400 ms debounce and GitHub's
  `Cache-Control: max-age=60` on unauthenticated responses keep normal usage well
  inside the limits; if a limit is hit, the user sees an explanatory message.
- **Responses are typed by assertion, not validated.** `res.json() as T` trusts the
  API shape. Runtime validation (e.g. Zod) at the API boundary would be the
  production approach; omitted here given the time-box.
- **`full_name` is the store key.** It is unique, human-readable and maps directly
  to `/repos/{owner}/{repo}`. If a repository is renamed the key becomes stale
  (GitHub redirects, so data still loads under the old name). The numeric `id`
  is immutable but less convenient.
- **Search returns the top 10 results** sorted by stars. No pagination.
- **No tests.** With more time: unit tests for the store actions (pure, easy to
  test) and integration tests for the search flow with a mocked API.
- **Refreshing all tracked repos issues one request per repository.** Acceptable at
  this scale; conditional requests using `ETag` would reduce quota usage.

---

## Possible improvements

- Replace hand-rolled fetching with TanStack Query for caching, retries and
  background revalidation
- Runtime response validation with Zod
- Light/dark theme toggle
- Additional charts (open issues, activity over time)
- Storybook for the component library
- ETag-based conditional requests to reduce rate limit consumption
