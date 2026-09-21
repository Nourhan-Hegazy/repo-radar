import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material"; //MUI components used to build the repo card
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BugReportIcon from "@mui/icons-material/BugReport";
import HistoryIcon from "@mui/icons-material/History";
import { useRepoStore } from "./store";
import type { GitHubRepo } from "./types";

//Renders a single repo as a card.

//RepoCardProps describes the data this component receives — a single repo
interface RepoCardProps {
  repo: GitHubRepo;
}

export function RepoCard({ repo }: RepoCardProps) {
  //{ repo }: RepoCardProps — destructuring the props object straight into a repo variable in the parameters
  //isTracked — a true/false derived from whether this repo's name is in trackedNames. This component re-renders only when that boolean changes. So starring one repo doesn't needlessly re-render unrelated cards
  const isTracked = useRepoStore((state) =>
    state.trackedNames.includes(repo.full_name),
  );
  const track = useRepoStore((state) => state.track);
  const untrack = useRepoStore((state) => state.untrack);

  const lastUpdated = new Date(repo.pushed_at).toLocaleDateString();

  return (
    //a card with a thin border, CardContent adds internal padding
    //target="_blank" — open in a new tab
    //noopener prevents the new page from accessing the window tab
    //chip -> a small pill shaped component used to display metadata like stars, issues, and last updated date
    // this pushes its two children to opposite ends: the repo link on the left, the star button on the right.
    //<Tooltip title={...}> — shows "Untrack" or "Track" on hover
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Link href={repo.html_url} target="_blank" rel="noopener noreferrer">
            <Typography variant="h6" component="span">
              {repo.full_name}
            </Typography>
          </Link>

          <Tooltip title={isTracked ? "Untrack" : "Track"}>
            <IconButton
              onClick={() =>
                isTracked ? untrack(repo.full_name) : track(repo)
              }
              color={isTracked ? "primary" : "default"}
            >
              {isTracked ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 1.5 }}
        >
          {repo.description ?? "No description provided."}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
            label={`Updated ${lastUpdated}`}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
