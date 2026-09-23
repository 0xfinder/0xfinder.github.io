import type { DetailsFrame, EventDetails, Schedule, Standing, Window } from "./types";

export const ITEMS_URL = "https://ddragon.leagueoflegends.com/cdn/PATCH_VERSION/img/item/";
export const CHAMPIONS_URL = "https://ddragon.leagueoflegends.com/cdn/PATCH_VERSION/img/champion/";
export const RUNES_JSON_URL =
  "https://ddragon.leagueoflegends.com/cdn/PATCH_VERSION/data/en_US/runesReforged.json";
export const ITEMS_JSON_URL =
  "https://ddragon.leagueoflegends.com/cdn/PATCH_VERSION/data/en_US/item.json";

const API_URL_PERSISTED = "https://esports-api.lolesports.com/persisted/gw";
const API_URL_LIVE = "https://feed.lolesports.com/livestats/v1";
// Upstream ships this key inside the client bundle, so it is already public and
// a static build has no server to hide it behind.
const API_KEY = "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";

// Live frames land every 10s. Walk the requested window backwards as failures
// pile up, and creep forwards again on a run of successes.
let secondDelay = 60;
let count = 0;
let failureCount = 0;

type ApiError = Error & { body?: { message?: string } };

async function requestJson(url: string, headers?: Record<string, string>): Promise<any> {
  const response = await fetch(url, { headers });
  const text = await response.text();
  let body: any;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }
  if (!response.ok) {
    const error: ApiError = new Error(body?.message ?? `${response.status} ${response.statusText}`);
    error.body = body;
    throw error;
  }
  return body;
}

/** Live endpoints return 404-ish bodies while a game's window has not opened yet. */
function isWindowNotReady(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return message.includes("window with end time less than");
}

export async function getSchedule(): Promise<Schedule | undefined> {
  try {
    const body = await requestJson(`${API_URL_PERSISTED}/getSchedule?hl=en-US`, {
      "x-api-key": API_KEY,
    });
    return body.data.schedule;
  } catch (error) {
    console.error("getSchedule", error);
  }
}

export async function getEventDetails(matchId: string): Promise<EventDetails | undefined> {
  try {
    const body = await requestJson(
      `${API_URL_PERSISTED}/getEventDetails?hl=en-US&id=${encodeURIComponent(matchId)}`,
      { "x-api-key": API_KEY },
    );
    return body.data.event;
  } catch (error) {
    console.error("getEventDetails", error);
  }
}

export async function getStandings(tournamentId: string): Promise<Standing[] | undefined> {
  try {
    const body = await requestJson(
      `${API_URL_PERSISTED}/getStandings?hl=en-US&tournamentId=${encodeURIComponent(tournamentId)}`,
      { "x-api-key": API_KEY },
    );
    return body.data.standings;
  } catch (error) {
    console.error("getStandings", error);
  }
}

/** Omitting `startingTime` returns the window from the start of the game. */
export async function getWindow(
  gameId: string,
  startingTime?: string,
): Promise<Window | undefined> {
  try {
    const query = startingTime ? `?startingTime=${encodeURIComponent(startingTime)}` : "";
    return await requestJson(`${API_URL_LIVE}/window/${gameId}${query}`);
  } catch (error) {
    console.error("getWindow", error);
  }
}

export async function getDetails(
  gameId: string,
  startingTime: string,
  lastFrameSuccess: boolean,
): Promise<{ frames?: DetailsFrame[] } | undefined> {
  if (count++ % 10 === 0) {
    failureCount = 0;
    secondDelay -= 10;
  }
  if (lastFrameSuccess) {
    failureCount = 0;
  } else {
    failureCount++;
  }
  try {
    return await requestJson(
      `${API_URL_LIVE}/details/${gameId}?startingTime=${encodeURIComponent(startingTime)}`,
    );
  } catch (error) {
    console.error("getDetails", error);
    if (!isWindowNotReady(error) || failureCount < 6) return;
    count = 1;
    failureCount = 0;
    secondDelay += 10;
  }
}

export async function getDataDragonJson(url: string, formattedPatchVersion: string): Promise<any> {
  const response = await fetch(url.replace("PATCH_VERSION", formattedPatchVersion));
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

export function getISODateMultiplyOf10(): string {
  const date = new Date();
  date.setMilliseconds(0);

  if (date.getSeconds() % 10 !== 0) {
    date.setSeconds(date.getSeconds() - (date.getSeconds() % 10));
  }

  date.setSeconds(date.getSeconds() - secondDelay);

  return date.toISOString();
}

export function getFormattedPatchVersion(patchVersion: string): string {
  return `${patchVersion.split(".").slice(0, 2).join(".")}.1`;
}
