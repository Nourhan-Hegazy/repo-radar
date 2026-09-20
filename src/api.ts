import type { GitHubRepo, SearchResponse } from "./types";

const BASE_URL = "https://api.github.com";

//centralized error handling
function checkResponse(res: Response) {
  if (res.ok) return; //true for status 200–299

  if (res.status === 403 || res.status === 429) {
    throw new Error(
      "GitHub rate limit reached. Please wait a minute and try again.",
    );
  }
  if (res.status === 404) {
    throw new Error("Repository not found.");
  }
  throw new Error(`GitHub API error (${res.status})`);
}

export async function searchRepos(query: string): Promise<GitHubRepo[]> {
  //q=${encodeURIComponent(query)} — the search term. encodeURIComponent safely encodes special characters so a search like c++ or hello world doesn't break the URL
  /*
    sort=stars&order=desc — most-starred first.
per_page=10 — return 10 results.
*/
  const url = `${BASE_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;

  const res = await fetch(url);
  checkResponse(res);

  const data = (await res.json()) as SearchResponse;
  return data.items;
}

//gets fresh details for one repo (used for refreshing tracked repos)
export async function fetchRepo(fullName: string): Promise<GitHubRepo> {
  const res = await fetch(`${BASE_URL}/repos/${fullName}`);
  checkResponse(res);

  return (await res.json()) as GitHubRepo;
}
