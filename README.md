# Repo Radar

Repo Radar is a small dashboard for searching GitHub repositories and keeping an
eye on the ones you care about. Search for a repo, add it to your tracked list,
and the app shows its stars, open issues, and when it was last updated — with a
quick bar chart comparing stars across everything you track.

- **Live demo:** https://repo-radar-smoky.vercel.app/
- **Repository:** https://github.com/Nourhan-Hegazy/repo-radar

## What it does

- Search GitHub repositories as you type (the input is debounced by 400 ms so it
  isn't firing a request on every keystroke).
- Track and untrack repositories with one click.
- A separate "Tracked" tab that lists everything you're following.
- For each tracked repo: stars, open issues, and last-updated date.
- Refresh a single repo, or refresh all tracked repos at once.
- Each tracked card loads and fails on its own — one repo erroring doesn't take
  the others down.
- Your tracked list is saved to `localStorage`, so it survives a page reload.
- A bar chart of stars across your tracked repos.

## Getting started

You'll need Node.js installed. i installed version 24.21, Then:

```bash
git clone https://github.com/Nourhan-Hegazy/repo-radar.git
cd repo-radar
npm install
npm run dev
```

The dev server runs at http://localhost:5173. It serves the app with hot module
replacement, so saved changes show up in the browser instantly without a full
reload.

Other scripts needed:

```bash
npm run dev       # start the dev server at http://localhost:5173
npm run build     # type-check and build for production
npm test          # run the test suite (Vitest)
```

## Tech stack

- **React 19 + TypeScript** for the UI.
- **Vite** for the dev server and build.
- **Zustand** (with its `persist` middleware) for state and localStorage.
- **MUI** for components, and **MUI X Charts** for the stars chart.
- **GitHub REST API** as the data source.
- **Vitest** + Testing Library for tests.

## How it's put together

```
src/
├── types.ts              Shared types
├── api.ts                GitHub calls + turning HTTP errors into messages
├── store.ts              Zustand store: tracking, persistence, refreshing
├── useDebounce.ts        The debounce hook
├── RepoCard.tsx          A search result with a track/untrack button
├── TrackedRepoCard.tsx   A tracked repo with its own stats and error state
├── TrackedList.tsx       The tracked view + "Refresh all"
├── StarsChart.tsx        The stars bar chart, derived from the store
├── App.tsx               Tabs, search box, layout
└── main.tsx              Entry point, theme setup
```

## A few decisions worth explaining

**Why Zustand instead of Redux.** The app has one thing to manage (the tracked
repos) and four actions. Redux Toolkit's slices and boilerplate would be a lot of
extra setup for that. Zustand is tiny and its `persist` middleware handles the
localStorage requirement for free. If the app grew a real caching layer — say it
had to fetch, cache, and re-sync data from many different endpoints — then a
dedicated data-fetching library would start to pay off: **RTK Query** (part of
Redux Toolkit) or **TanStack Query** (a standalone library, not tied to Redux).

**The list vs. live data.** The store keeps these two apart:

```ts
trackedNames: string[]                 // saved to localStorage
repoData: Record<string, RepoState>    // never saved
```

`trackedNames` is the intent — small and stable, fine to persist. `repoData` is
live data like star counts, which goes stale within minutes. Persisting it would
show wrong numbers on load, so the app only saves your list and refetches the
stats when it starts up.

**No global loading flag.** Each repo carries its own status and error, so
refreshing one card re-renders only that card. A failed refresh keeps the old
data on screen next to the error, so a temporary blip doesn't wipe the card.

**Refresh-all uses `Promise.allSettled`.** Refreshes run in parallel, and one
repo failing (deleted, renamed, rate-limited) won't abort the rest. `Promise.all`
would bail on the first error.

**Stale searches are ignored.** Each search effect flips a `cancelled` flag on
cleanup, so a slow response from an old query can't overwrite a newer one.

**Error handling lives in one place.** `fetch` doesn't throw on 4xx/5xx, so
`api.ts` checks `res.ok` and translates status codes into readable messages
(rate limit, not found, and so on). Components just show `error.message`.

## Seeing the error states

Both error paths are handled centrally in `api.ts` and shown per-card, so you
can try them out yourself:

**Hitting the GitHub rate limit.** The unauthenticated search endpoint allows
about 10 requests a minute, per IP. Every settled query sends one request, so
firing off many _different_ searches in quick succession trips that limit fairly
easily. The search box is debounced by 400 ms, so ordinary typing costs one
request per word, not one per keystroke — to reach the limit on purpose, type
several distinct queries fast within a minute.

Once GitHub returns `403`/`429`, `api.ts` turns it into "GitHub rate limit
reached. Please wait a minute and try again.", and the search results area shows
that message in place of the list. It clears on the next successful search once
the limit resets.

**A tracked repo that no longer exists.** If a repo you're tracking gets deleted, GitHub responds with `404` on the next refresh. `api.ts` maps that to
"Repository not found.", and the tracked card shows it in a red alert while
keeping any previously loaded stats visible underneath.

## Assumptions and limitations

- **It uses the unauthenticated GitHub API.** That means roughly 10 searches a
  minute and 60 other requests an hour, per IP. No token is included on purpose —
  any token shipped in a frontend bundle is readable by anyone. A production
  version would proxy requests through a small backend that holds the token.
- **Rate limits are shown, not hidden.** The debounce and GitHub's short cache
  keep normal use well within the limits, but if you do hit one, you'll see a
  message explaining what happened.
- **API responses are trusted, not validated.** to keep things small.
- **Search shows the top 10 results** by stars. No pagination.

## Tests

I added some unit tests to make sure my code is reliable.
There's a Vitest suite covering the store actions, the API layer (with `fetch`
mocked), and the `RepoCard` component. Run it with:

```bash
npm test
```
