import { browser } from "$app/environment";

export type PrefKey = "stream" | "chat" | "sound";

/** Upstream stores these as the strings "mute"/"unmute"; keep that format. */
function read(key: PrefKey, fallback: boolean): boolean {
  if (!browser) return fallback;
  const stored = localStorage.getItem(key);
  return stored ? stored === "unmute" : fallback;
}

export const prefs = $state<Record<PrefKey, boolean>>({
  stream: read("stream", false),
  chat: read("chat", false),
  sound: read("sound", false),
});

export function setPref(key: PrefKey, value: boolean): void {
  prefs[key] = value;
  localStorage.setItem(key, value ? "unmute" : "mute");
}
