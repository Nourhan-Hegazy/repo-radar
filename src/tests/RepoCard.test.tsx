import { beforeEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RepoCard } from "../RepoCard";
import { useRepoStore } from "../store";
import { makeRepo } from "./testUtils";

describe("RepoCard", () => {
  beforeEach(() => {
    useRepoStore.setState({ trackedNames: [], repoData: {} });
  });

  it("renders the repo name, description and stars", () => {
    render(<RepoCard repo={makeRepo({ stargazers_count: 1234 })} />);

    expect(screen.getByText("facebook/react")).toBeInTheDocument();
    expect(screen.getByText("a repo")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("falls back when there is no description", () => {
    render(<RepoCard repo={makeRepo({ description: null })} />);
    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  it("tracks the repo when the star is clicked", async () => {
    const user = userEvent.setup();
    render(<RepoCard repo={makeRepo()} />);

    await user.click(screen.getByRole("button", { name: "Track" }));

    expect(useRepoStore.getState().trackedNames).toEqual(["facebook/react"]);
  });

  it("untracks the repo when already tracked", async () => {
    const user = userEvent.setup();
    useRepoStore.getState().track(makeRepo());
    render(<RepoCard repo={makeRepo()} />);

    await user.click(screen.getByRole("button", { name: "Untrack" }));

    expect(useRepoStore.getState().trackedNames).toEqual([]);
  });
});
