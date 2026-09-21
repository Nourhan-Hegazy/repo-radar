import { BarChart } from "@mui/x-charts/BarChart";
import { useRepoStore } from "./store";

export function StarsChart() {
  const repoData = useRepoStore((state) => state.repoData);

  //Pulls all tracked repos' data
  const repos = Object.values(repoData)
    .map((entry) => entry.repo) //extract the repo object from each entry
    .filter((repo) => repo !== null); //drop null repos

  if (repos.length === 0) return null;

  return (
    <BarChart
      height={300}
      xAxis={[
        {
          data: repos.map((r) => r.full_name), //repo names
          scaleType: "band", //categorical bars
          label: "Repository name",
        },
      ]}
      series={[
        { data: repos.map((r) => r.stargazers_count), label: "Stars Count" }, //star count
      ]}
    />
  );
}
