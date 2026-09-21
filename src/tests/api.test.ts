import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRepo, searchRepos } from "../api";
import { makeRepo } from "./testUtils";

function mockFetchResponse(body: unknown, init: Partial<Response> = {}) {
  const response = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as Response;
  return vi.fn().mockResolvedValue(response);
}

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchResponse({ total_count: 0, items: [] }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("searchRepos", () => {
    it("returns the items array on success", async () => {
      const repos = [makeRepo({ id: 1 }), makeRepo({ id: 2 })];
      vi.stubGlobal(
        "fetch",
        mockFetchResponse({ total_count: 2, items: repos }),
      );

      const result = await searchRepos("react");
      expect(result).toEqual(repos);
    });

    it("URL-encodes the query", async () => {
      const fetchMock = mockFetchResponse({ total_count: 0, items: [] });
      vi.stubGlobal("fetch", fetchMock);

      await searchRepos("c++");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain("q=c%2B%2B");
    });

    it("throws a rate-limit error on 403", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchResponse({}, { ok: false, status: 403 }),
      );
      await expect(searchRepos("react")).rejects.toThrow(
        "GitHub rate limit reached. Please wait a minute and try again.",
      );
    });

    it("throws a rate-limit error on 429", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchResponse({}, { ok: false, status: 429 }),
      );
      await expect(searchRepos("react")).rejects.toThrow(
        "GitHub rate limit reached. Please wait a minute and try again.",
      );
    });

    it("throws a not-found error on 404", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchResponse({}, { ok: false, status: 404 }),
      );
      await expect(searchRepos("react")).rejects.toThrow(
        "Repository not found.",
      );
    });

    it("throws a generic error on other failures", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchResponse({}, { ok: false, status: 500 }),
      );
      await expect(searchRepos("react")).rejects.toThrow(
        "GitHub API error (500)",
      );
    });
  });

  describe("fetchRepo", () => {
    it("requests the correct URL and returns the repo", async () => {
      const repo = makeRepo();
      const fetchMock = mockFetchResponse(repo);
      vi.stubGlobal("fetch", fetchMock);

      const result = await fetchRepo("facebook/react");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.github.com/repos/facebook/react",
      );
      expect(result).toEqual(repo);
    });

    it("throws on a failed response", async () => {
      vi.stubGlobal(
        "fetch",
        mockFetchResponse({}, { ok: false, status: 404 }),
      );
      await expect(fetchRepo("nope/nope")).rejects.toThrow(
        "Repository not found.",
      );
    });
  });
});
