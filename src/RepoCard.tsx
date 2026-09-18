import { Box, Card, CardContent, Chip, Link, Typography } from "@mui/material"; //MUI components used to build the repo card
import StarIcon from "@mui/icons-material/Star";
import BugReportIcon from "@mui/icons-material/BugReport";
import HistoryIcon from "@mui/icons-material/History";
import type { GitHubRepo } from "./types";

//Renders a single repo as a card.

//RepoCardProps describes the data this component receives — a single repo
interface RepoCardProps {
  repo: GitHubRepo;
}

export function RepoCard({ repo }: RepoCardProps) {
  //{ repo }: RepoCardProps — destructuring the props object straight into a repo variable in the parameters.
  const lastUpdated = new Date(repo.pushed_at).toLocaleDateString();

  return (
    //a card with a thin border, CardContent adds internal padding
    //target="_blank" — open in a new tab
    //chip -> a small pill shaped component used to display metadata like stars, issues, and last updated date
    <Card variant="outlined">
      <CardContent>
        <Link href={repo.html_url} target="_blank" rel="noopener noreferrer">
          <Typography variant="h6" component="span">
            {repo.full_name}
          </Typography>
        </Link>

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
