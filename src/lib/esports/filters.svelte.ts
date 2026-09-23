import { SvelteSet } from "svelte/reactivity";

export type MatchStatus = "live" | "upcoming" | "recent";

export const filters = $state({
  matchStatus: new SvelteSet<MatchStatus>(["live", "upcoming", "recent"]),
  leagues: new SvelteSet<string>(),
  availableLeagues: [] as string[],
});

export function toggleMatchStatus(status: MatchStatus): void {
  if (filters.matchStatus.has(status)) {
    filters.matchStatus.delete(status);
  } else {
    filters.matchStatus.add(status);
  }
}

export function toggleLeague(league: string): void {
  if (filters.leagues.has(league)) {
    filters.leagues.delete(league);
  } else {
    filters.leagues.add(league);
  }
}

/** An empty selection is how "all leagues" is represented. */
export function clearLeagues(): void {
  filters.leagues.clear();
}
