import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRepoStore } from "../store";
import { fetchRepo } from "../api";
import { makeRepo } from "./testUtils";

vi.mock("../api", () => ({
  fetchRepo: vi.fn(),
}));

const mockedFetchRepo = vi.mocked(fetchRepo);

describe("useRepoStore", () => {
  beforeEach(() => {
    useRepoStore.setState({ trackedNames: [], repoData: {} });
    mockedFetchRepo.mockReset();
  });

  it("tracks a repo and stores it as success", () => {
    const repo = makeRepo();
    useRepoStore.getState().track(repo);

    const state = useRepoStore.getState();
    expect(state.trackedNames).toEqual(["facebook/react"]);
    expect(state.repoData["facebook/react"]).toEqual({
      status: "success",
      error: "",
      repo,
    });
  });

  it("does not track the same repo twice", () => {
    const repo = makeRepo();
    useRepoStore.getState().track(repo);
    useRepoStore.getState().track(repo);

    expect(useRepoStore.getState().trackedNames).toEqual(["facebook/react"]);
  });

  it("untracks a repo and removes its data", () => {
    const repo = makeRepo();
    const { track, untrack } = useRepoStore.getState();
    track(repo);
    untrack("facebook/react");

    const state = useRepoStore.getState();
    expect(state.trackedNames).toEqual([]);
    expect(state.repoData["facebook/react"]).toBeUndefined();
  });

  it("refreshOne stores fresh data on success", async () => {
    const fresh = makeRepo({ stargazers_count: 999 });
    mockedFetchRepo.mockResolvedValue(fresh);

    await useRepoStore.getState().refreshOne("facebook/react");

    expect(mockedFetchRepo).toHaveBeenCalledWith("facebook/react");
    expect(useRepoStore.getState().repoData["facebook/react"]).toEqual({
      status: "success",
      error: "",
      repo: fresh,
    });
  });

  it("refreshOne stores the error message on failure", async () => {
    mockedFetchRepo.mockRejectedValue(new Error("Repository not found."));

    await useRepoStore.getState().refreshOne("facebook/react");

    const entry = useRepoStore.getState().repoData["facebook/react"];
    expect(entry.status).toBe("error");
    expect(entry.error).toBe("Repository not found.");
  });

  it("refreshAll refreshes every tracked repo", async () => {
    useRepoStore.setState({
      trackedNames: ["facebook/react", "vitejs/vite"],
      repoData: {},
    });
    mockedFetchRepo.mockImplementation(async (fullName) =>
      makeRepo({ full_name: fullName }),
    );

    await useRepoStore.getState().refreshAll();

    expect(mockedFetchRepo).toHaveBeenCalledTimes(2);
    expect(mockedFetchRepo).toHaveBeenCalledWith("facebook/react");
    expect(mockedFetchRepo).toHaveBeenCalledWith("vitejs/vite");
  });

  it("refreshAll keeps going when one repo fails", async () => {
    useRepoStore.setState({
      trackedNames: ["good/repo", "bad/repo"],
      repoData: {},
    });
    mockedFetchRepo.mockImplementation(async (fullName) => {
      if (fullName === "bad/repo") throw new Error("boom");
      return makeRepo({ full_name: fullName });
    });

    await useRepoStore.getState().refreshAll();

    const { repoData } = useRepoStore.getState();
    expect(repoData["good/repo"].status).toBe("success");
    expect(repoData["bad/repo"].status).toBe("error");
  });
});
