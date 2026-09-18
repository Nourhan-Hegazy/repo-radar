// import { useEffect, useState } from "react";
// import { Alert, CircularProgress, Container, Typography } from "@mui/material";
// import type { SearchResponse } from "./types/github"; //3type means nly a shape, not real runnable code

import { useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Container,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { searchRepos } from "./api";
import { useDebounce } from "./useDebounce";
import { RepoCard } from "./RepoCard";
import type { GitHubRepo, Status } from "./types";

interface SearchState {
  status: Status;
  repos: GitHubRepo[];
  error: string;
}

const IDLE: SearchState = { status: "idle", repos: [], error: "" };

function App() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>(IDLE);

  const debouncedQuery = useDebounce(query);
  const trimmedQuery = debouncedQuery.trim(); //remove leading/trailing spaces ("  react  " → "react").
  const isTooShort = trimmedQuery.length < 2;

  useEffect(() => {
    //if the query is too short, return early — don't call GitHub
    if (isTooShort) return;

    let cancelled = false;

    const run = async () => {
      setSearch({ status: "loading", repos: [], error: "" });

      try {
        const repos = await searchRepos(trimmedQuery);
        if (!cancelled) {
          setSearch({ status: "success", repos, error: "" });
        }
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
      cancelled = true; //effect cleanup: mark the request as cancelled to prevent state updates after unmounting or query change
    };
  }, [trimmedQuery, isTooShort]); //re-run whenever the settled query (or the too-short flag) changes

  const { status, repos, error } = isTooShort ? IDLE : search; //Pick which state to actually display: if the query is too short, always show IDLE; otherwise show the real search state

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1">
            Repo Radar
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
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
          <Alert severity="info">No repositories matched your search.</Alert>
        )}

        {status === "success" && repos.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </Box>
        )}
      </Container>
    </>
  );
}

export default App;
