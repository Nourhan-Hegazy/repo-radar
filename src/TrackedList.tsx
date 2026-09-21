import { Alert, Box, Button, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRepoStore } from "./store";
import { TrackedRepoCard } from "./TrackedRepoCard";
import { StarsChart } from "./StarsChart";

export function TrackedList() {
  const trackedNames = useRepoStore((state) => state.trackedNames);
  const refreshAll = useRepoStore((state) => state.refreshAll);
  const repoData = useRepoStore((state) => state.repoData);

  // .some() — an array method that returns true if at least one item passes the test
  //used to disable the "Refresh All" button and show a spinner
  const isRefreshing = trackedNames.some(
    (fullName) => repoData[fullName]?.status === "loading",
  );

  if (trackedNames.length === 0) {
    return (
      <Alert severity="info">
        No tracked repositories yet. Search for a repo and click the star to
        track it.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={
            isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />
          }
          onClick={() => refreshAll()}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing…" : "Refresh All"}
        </Button>
      </Box>

      <StarsChart />

      {trackedNames.map((fullName) => (
        <TrackedRepoCard key={fullName} fullName={fullName} />
      ))}
    </Box>
  );
}
