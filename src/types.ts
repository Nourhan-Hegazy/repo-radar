export interface GitHubRepo {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  open_issues_count: number;
  pushed_at: string;
}

export interface SearchResponse {
  total_count: number;
  items: GitHubRepo[];
}

export type Status = "idle" | "loading" | "success" | "error";
