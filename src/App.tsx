import { useEffect, useState } from "react";
import { Alert, CircularProgress, Container, Typography } from "@mui/material";
import type { SearchResponse } from "./types/github";

function App() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(
          "https://api.github.com/search/repositories?q=react&per_page=5&sort=stars&order=desc",
        );

        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status}`);
        }

        const data = (await res.json()) as SearchResponse;

        console.log("--- FULL RESPONSE ---", data);
        console.log("Total results:", data.total_count);

        data.items.forEach((repo) => {
          console.log(
            repo.full_name,
            "| stars:",
            repo.stargazers_count,
            "| issues:",
            repo.open_issues_count,
            "| pushed:",
            repo.pushed_at,
          );
        });

        setStatus("success");
      } catch (err) {
        console.error("Fetch failed:", err);
        setStatus("error");
      }
    };

    run();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Repo Radar
      </Typography>

      {status === "loading" && <CircularProgress />}
      {status === "error" && (
        <Alert severity="error">Something went wrong</Alert>
      )}
      {status === "success" && (
        <Alert severity="success">Data fetched — check the console (F12)</Alert>
      )}
    </Container>
  );
}

export default App;
