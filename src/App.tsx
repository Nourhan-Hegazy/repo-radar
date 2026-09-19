import { useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { searchRepos } from "./api";
import { useDebounce } from "./useDebounce";
import { RepoCard } from "./RepoCard";
import { TrackedList } from "./TrackedList";
import { useRepoStore } from "./store";
import type { GitHubRepo, Status } from "./types";

interface SearchState {
  status: Status;
  repos: GitHubRepo[];
  error: string;
}

const IDLE: SearchState = { status: "idle", repos: [], error: "" };

function App() {
  const [tab, setTab] = useState(0); //tab — new local state for which tab is active. 0 = Search, 1 = Tracked. Starts at 0.
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>(IDLE);

  //trackedCount — a selector reading just the number of tracked repos (for the tab label). Re-renders App only when the count changes.
  const trackedCount = useRepoStore((state) => state.trackedNames.length);

  const debouncedQuery = useDebounce(query);
  const trimmedQuery = debouncedQuery.trim(); //remove leading/trailing spaces ("  react  " → "react").
  const isTooShort = trimmedQuery.length < 2;

  // Stats are not persisted, so refetch everything once on load.
  useEffect(() => {
    void useRepoStore.getState().refreshAll();
  }, []); //The [] dependency array means this effect runs once, right after the app first mounts.

  useEffect(() => {
    //if the query is too short, return early — don't call GitHub
    if (isTooShort) return;

    let cancelled = false;

    const run = async () => {
      setSearch({ status: "loading", repos: [], error: "" });
      try {
        const repos = await searchRepos(trimmedQuery);
        if (!cancelled) setSearch({ status: "success", repos, error: "" });
      } catch (err) {
        if (!cancelled) {
          setSearch({
            status: "error",
            repos: [],
            error: err instanceof Error ? err.message : "Something went wrong",
          });
        }
      }
    };

    run(); //run(); — actually start the async function
    return () => {
      //effect cleanup: mark the request as cancelled to prevent state updates after unmounting or query change
      cancelled = true;
    };
  }, [trimmedQuery, isTooShort]); //re-run whenever the settled query (or the too-short flag) changes

  const { status, repos, error } = isTooShort ? IDLE : search; //Pick which state to actually display: if the query is too short, always show IDLE; otherwise show the real search state

  return (
    /*
    <AppBar position="static"> — MUI's top bar. <Toolbar> gives it standard height/padding.
<Typography variant="h6" component="h1"> — the title: looks like an h6 but is semantically the page's <h1>
*/

    /*
<Tabs value={tab} onChange={(_, next) => setTab(next)}> — a controlled tab strip. value={tab} says which tab is active. onChange fires when you click a tab.
(_, next) — the handler receives two arguments: the event and the newly selected index. The _ is a convention meaning "I'm ignoring this argument" (the event); next is the index we want. setTab(next) switches tabs.
<Tab label="Search" /> — first tab (index 0).
<Tab label={`Tracked (${trackedCount})`} /> — second tab (index 1), whose label shows the live count
*/
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1">
            Repo Radar
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mb: 3 }}>
          <Tab label="Search" />
          <Tab label={`Tracked (${trackedCount})`} />
        </Tabs>

        {tab === 0 && (
          <>
            <TextField
              fullWidth
              label="Search GitHub repositories"
              placeholder="e.g. react, zustand, vite"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ mb: 3 }}
            />

            {status === "idle" && (
              <Typography color="text.secondary">
                Start typing to search GitHub repositories.
              </Typography>
            )}

            {status === "loading" && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {status === "error" && <Alert severity="error">{error}</Alert>}

            {status === "success" && repos.length === 0 && (
              <Alert severity="info">
                No repositories matched your search.
              </Alert>
            )}

            {status === "success" && repos.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {repos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </Box>
            )}
          </>
        )}

        {tab === 1 && <TrackedList />}
      </Container>
    </>
  );
}

export default App;
