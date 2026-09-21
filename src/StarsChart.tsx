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
