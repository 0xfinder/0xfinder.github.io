import type { EventDetails, ScheduleEvent, WindowFrame, WindowParticipant } from "./types";

/** League's patch-notes URL carries a season prefix; bump this each season. */
const PATCH_NOTES_SEASON = 26;

export function patchNotesUrl(patchVersion: string): string {
  return `https://www.leagueoflegends.com/en-us/news/game-updates/patch-${PATCH_NOTES_SEASON}-${patchVersion.split(".")[1]}-notes/`;
}

export function capitalizeFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DAY_MS = 86_400_000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Groups fixtures into day buckets regardless of the time within the day. */
export function dayKey(startTime: Date | string): number {
  return startOfDay(new Date(startTime));
}

export function isToday(startTime: Date | string, now: Date = new Date()): boolean {
  return dayKey(startTime) === startOfDay(now);
}

/** "Today" / "Tomorrow" / "Wed 24 Sep", relative to the viewer's clock. */
export function dayLabel(startTime: Date | string, now: Date = new Date()): string {
  const offset = Math.round((dayKey(startTime) - startOfDay(now)) / DAY_MS);
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  if (offset === -1) return "Yesterday";
  const date = new Date(startTime);
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  return `${weekday} ${date.getDate()} ${month}`;
}

/** Fixed-width 24h clock for the agenda's time rail. */
export function clockTime(startTime: Date | string): string {
  return new Date(startTime).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export function countdown(startTime: Date | string, now: number = Date.now()): string {
  const minutes = Math.round((new Date(startTime).getTime() - now) / 60_000);
  if (minutes < 1) return "starting now";
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `in ${hours}h ${minutes % 60}m`;
  return `in ${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function getInGameTime(startTime: string, currentTime: string): string {
  const startDate = new Date(startTime);
  const currentDate = new Date(currentTime);
  let seconds = Math.floor((currentDate.valueOf() - startDate.valueOf()) / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  hours = hours - days * 24;
  minutes = minutes - days * 24 * 60 - hours * 60;
  seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;
  const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return hours ? `${hours}:${minutes}:${secondsString}` : `${minutes}:${secondsString}`;
}

export function getGoldDifference(player: WindowParticipant, frame: WindowFrame) {
  if (player.participantId < 6) {
    const redPlayer = frame.redTeam.participants[player.participantId - 1];
    const goldResult = player.totalGold - redPlayer.totalGold;
    return {
      style: goldResult > 0 ? "positive" : "negative",
      goldDifference:
        goldResult > 0
          ? `+${Number(goldResult).toLocaleString("en-us")}`
          : Number(goldResult).toLocaleString("en-us"),
    };
  }
  const bluePlayer = frame.blueTeam.participants[player.participantId - 6];
  const goldResult = player.totalGold - bluePlayer.totalGold;
  return {
    style: goldResult > 0 ? "positive" : "negative",
    goldDifference:
      goldResult > 0
        ? `+${Number(goldResult).toLocaleString("en-us")}`
        : Number(goldResult).toLocaleString("en-us"),
  };
}

/** Only the blue:red ratio matters here; the flex values are consumed as proportions. */
export function getGoldPercentage(goldBlue: number, goldRed: number) {
  const total = goldBlue + goldRed;
  return {
    goldBluePercentage: (goldBlue / 100) * total,
    goldRedPercentage: (goldRed / 100) * total,
  };
}

const GAME_STATES: Record<string, string> = {
  in_game: "In Progress",
  paused: "Paused",
  finished: "Finished",
  completed: "Finished",
  unstarted: "Unstarted",
  inProgress: "In Progress",
};

export function formatMatchState(
  eventDetails: EventDetails,
  frame: WindowFrame,
  scheduleEvent?: ScheduleEvent,
): string | undefined {
  if (eventDetails.match.games.length === 1) return GAME_STATES[frame.gameState];
  const gamesFinished = eventDetails.match.games.filter(
    (game) => game.state === "completed" || game.state === "unneeded",
  );
  if (gamesFinished.length >= eventDetails.match.games.length) return GAME_STATES.completed;
  // The schedule carries the series state, but a match can age out of the
  // schedule window, so fall back to reading it from the games themselves.
  return GAME_STATES[scheduleEvent?.state ?? "inProgress"];
}

export function getNextUnstartedGameIndex(eventDetails: EventDetails): number {
  const lastCompletedGame = eventDetails.match.games
    .slice()
    .reverse()
    .find((game) => game.state === "completed");
  const nextUnstartedGame = eventDetails.match.games.find(
    (game) => game.state === "unstarted" || game.state === "inProgress",
  );
  return nextUnstartedGame
    ? nextUnstartedGame.number
    : lastCompletedGame
      ? lastCompletedGame.number
      : eventDetails.match.games.length;
}

/** Frames report `in_game`/`finished`; upstream also rendered a `paused` badge. */
const GAME_STATE_LABELS: Record<string, string> = {
  in_game: "in game",
  paused: "game paused",
  finished: "game ended",
};

export function gameStateLabel(rawState: string): string {
  return GAME_STATE_LABELS[rawState] ?? rawState.replace(/_/g, " ");
}

/** The site nav already owns theming, so only the game-state icon is set here. */
export function gameStateIcon(rawState: string): string {
  if (rawState === "finished") return "🔴";
  if (rawState === "paused") return "🟠";
  return "🟢";
}
