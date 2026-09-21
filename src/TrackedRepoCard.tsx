import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import BugReportIcon from "@mui/icons-material/BugReport";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRepoStore } from "./store";

//This renders one repo in the Tracked tab, reading its live stats from the store and offering Refresh/Untrack buttons.
interface TrackedRepoCardProps {
  fullName: string;
}

export function TrackedRepoCard({ fullName }: TrackedRepoCardProps) {
  const entry = useRepoStore((state) => state.repoData[fullName]); //live entry
  const refreshOne = useRepoStore((state) => state.refreshOne);
  const untrack = useRepoStore((state) => state.untrack);

  const status = entry?.status ?? "idle";
  const repo = entry?.repo ?? null; //?. avoids crashing if the entry is missing
  const isLoading = status === "loading";

  //last element: "If we have no repo data yet and we're currently loading, show the text 'Loading stats…'."
  ///refresh button and untrack button
  return (
    //disabled={isLoading} — can't click while it's already refreshing
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Link
            href={`https://github.com/${fullName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography variant="h6" component="span">
              {fullName}
            </Typography>
          </Link>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  onClick={() => refreshOne(fullName)}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Untrack">
              <IconButton onClick={() => untrack(fullName)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {status === "error" && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {entry?.error}
          </Alert>
        )}

        {repo && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
            <Chip
              size="small"
              icon={<StarIcon />}
              label={repo.stargazers_count.toLocaleString()}
            />
            <Chip
              size="small"
              icon={<BugReportIcon />}
              label={`${repo.open_issues_count.toLocaleString()} issues`}
            />
            <Chip
              size="small"
              icon={<HistoryIcon />}
              label={`Updated ${new Date(repo.pushed_at).toLocaleDateString()}`}
            />
          </Box>
        )}

        {!repo && status === "loading" && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading stats…
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
