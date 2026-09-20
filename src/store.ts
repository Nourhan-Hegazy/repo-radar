import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchRepo } from "./api";
import type { GitHubRepo, Status } from "./types";

export interface RepoState {
  status: Status;
  error: string;
  repo: GitHubRepo | null;
}

interface RepoStore {
  trackedNames: string[];
  repoData: Record<string, RepoState>; //<key, value string>: full repo name -> repo state>

  track: (repo: GitHubRepo) => void;
  untrack: (fullName: string) => void;
  refreshOne: (fullName: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}
const EMPTY_ENTRY: RepoState = { status: "idle", error: "", repo: null }; //fallback

export const useRepoStore = create<RepoStore>()(
  // create(...): Zustand's factory
  //wraps your store so it auto-saves to localStorage and reloads it on startup. The first argument is the store definition; the second (further down) is the persistence config.
  persist(
    (set, get) => {
      /* this function defines the store. Zustand hands two tools:
set — updates the store (like setState).
get — reads the current store values on demand.
*/
      //update one repo's entry in repoData while leaving the other repos untouched
      const setEntry = (fullName: string, patch: Partial<RepoState>) => {
        //Partial<RepoState> means "an object with some of RepoState's fields, all optional." So you can pass just { status: "loading" } without the other fields.
        set((state) => {
          const current = state.repoData[fullName] ?? EMPTY_ENTRY;
          return {
            repoData: {
              ...state.repoData, //... copies existing entries to never mutate state directly
              [fullName]: { ...current, ...patch }, //(React/Zustand rely on new object references to detect changes)
            },
          };
        });
      };

      return {
        trackedNames: [],
        repoData: {},

        track: (repo) => {
          const { trackedNames } = get(); // read current state; destructure out trackedNames
          if (trackedNames.includes(repo.full_name)) return;

          set({ trackedNames: [...trackedNames, repo.full_name] }); //creates a new array with the old items plus the new one
          setEntry(repo.full_name, { status: "success", error: "", repo }); //store the repo's data immediately as "success"
        },

        untrack: (fullName) => {
          const { trackedNames, repoData } = get();
          const nextRepoData = { ...repoData };
          delete nextRepoData[fullName];

          set({
            trackedNames: trackedNames.filter((name) => name !== fullName),
            repoData: nextRepoData,
          });
        },

        refreshOne: async (fullName) => {
          setEntry(fullName, { status: "loading", error: "" });

          try {
            const repo = await fetchRepo(fullName);
            setEntry(fullName, { status: "success", error: "", repo });
          } catch (err) {
            setEntry(fullName, {
              status: "error",
              error: err instanceof Error ? err.message : "Failed to refresh",
            });
          }
        },

        refreshAll: async () => {
          const { trackedNames, refreshOne } = get();
          await Promise.allSettled(
            //store the repo's data immediately as "success"
            trackedNames.map((name) => refreshOne(name)),
          );
        },
      };
    },
    {
      //The persist options
      name: "repo-radar", // the localStorage key
      partialize: (state) => ({ trackedNames: state.trackedNames }), // picks which slice to save, only trackedNames is persisted
    },
  ),
);
