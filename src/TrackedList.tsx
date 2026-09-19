import { Alert, Box, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRepoStore } from "./store";
import { TrackedRepoCard } from "./TrackedRepoCard";

export function TrackedList() {
  const trackedNames = useRepoStore((state) => state.trackedNames);
  const refreshAll = useRepoStore((state) => state.refreshAll);

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
          startIcon={<RefreshIcon />}
          onClick={() => refreshAll()}
        >
          Refresh all
        </Button>
      </Box>

      {trackedNames.map((fullName) => (
        <TrackedRepoCard key={fullName} fullName={fullName} />
      ))}
    </Box>
  );
}
