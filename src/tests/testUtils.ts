import type { GitHubRepo } from "../types";

export function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 1,
    full_name: "facebook/react",
    description: "a repo",
    html_url: "https://github.com/facebook/react",
    stargazers_count: 100,
    open_issues_count: 5,
    pushed_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}
