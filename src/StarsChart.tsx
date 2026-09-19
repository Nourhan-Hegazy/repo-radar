// import { Card, CardContent, Typography } from "@mui/material";
// import { BarChart } from "@mui/x-charts/BarChart";
// import { useRepoStore } from "./store";
// import type { GitHubRepo } from "./types";

// export function StarsChart() {
//   const trackedNames = useRepoStore((state) => state.trackedNames);
//   const repoData = useRepoStore((state) => state.repoData);

//   const repos = trackedNames
//     .map((fullName) => repoData[fullName]?.repo)
//     .filter((repo): repo is GitHubRepo => repo !== null && repo !== undefined);

//   if (repos.length === 0) {
//     return null;
//   }

//   const labels = repos.map(
//     (repo) => repo.full_name.split("/")[1] ?? repo.full_name,
//   );
//   const stars = repos.map((repo) => repo.stargazers_count);

//   return (
//     <Card variant="outlined">
//       <CardContent>
//         <Typography variant="subtitle1" gutterBottom>
//           Stars per tracked repository
//         </Typography>

//         <BarChart
//           height={300}
//           xAxis={[{ data: labels, scaleType: "band" }]}
//           series={[{ data: stars, label: "Stars" }]}
//         />
//       </CardContent>
//     </Card>
//   );
// }
import { BarChart } from "@mui/x-charts/BarChart";
import { useRepoStore } from "./store";

export function StarsChart() {
  const repoData = useRepoStore((state) => state.repoData);

  const repos = Object.values(repoData)
    .map((entry) => entry.repo)
    .filter((repo) => repo !== null);

  if (repos.length === 0) return null;

  return (
    <BarChart
      height={300}
      xAxis={[
        {
          data: repos.map((r) => r.full_name),
          scaleType: "band",
          label: "Repository name",
        },
      ]}
      series={[
        { data: repos.map((r) => r.stargazers_count), label: "Stars Count" },
      ]}
    />
  );
}
