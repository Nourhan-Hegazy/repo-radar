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

// Status represents the current state of a repository fetch operation.
//this is how they are returned by the github API
export type Status = "idle" | "loading" | "success" | "error";
