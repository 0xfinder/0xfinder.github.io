// Per-kana quiz statistics, persisted in localStorage.
//
// Keys are the glyph strings themselves, which are unique across hiragana,
// katakana, and yōon combinations (e.g. あ / ア / きゃ / キャ all differ), so
// a user weak on katakana ア is unaffected by a perfect record on あ.

export interface KanaStats {
  correct: number;
  wrong: number;
  /** Epoch ms of the last time this kana was asked. */
  lastSeen: number;
  /** Whether that last attempt was answered correctly. */
  lastResult: boolean;
}

export type KanaStatsMap = Record<string, KanaStats>;

const STORAGE_KEY = "kana-quiz-stats-v1";

const EMPTY: KanaStats = { correct: 0, wrong: 0, lastSeen: 0, lastResult: true };

export function loadStats(): KanaStatsMap {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<KanaStats>>;
    const map: KanaStatsMap = {};
    for (const [char, s] of Object.entries(parsed)) {
      if (!char || typeof s !== "object" || s === null) continue;
      map[char] = {
        correct: Math.max(0, Math.floor(s.correct ?? 0)),
        wrong: Math.max(0, Math.floor(s.wrong ?? 0)),
        lastSeen: Number(s.lastSeen) || 0,
        lastResult: Boolean(s.lastResult),
      };
    }
    return map;
  } catch {
    // Corrupted or unreadable data: start fresh rather than breaking the quiz.
    return {};
  }
}

export function saveStats(map: KanaStatsMap): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or unavailable (e.g. private mode): the quiz keeps working,
    // it just won't persist between visits.
  }
}

/** Returns a new map with this kana's answer recorded. */
export function recordAnswer(map: KanaStatsMap, char: string, correct: boolean): KanaStatsMap {
  const prev = map[char] ?? EMPTY;
  return {
    ...map,
    [char]: {
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
      lastSeen: Date.now(),
      lastResult: correct,
    },
  };
}

/**
 * Selection weight for weighted-random question picking.
 *
 * - Never seen: baseline 1, so new kana still get a fair shot.
 * - Error rate scales the weight 0.5 (always correct) → 4.5 (never correct),
 *   so kana you struggle with appear several times more often.
 * - A recent miss gets an extra boost (×2 within 2 minutes, ×1.5 within 15),
 *   reinforcing the mistake while it's fresh, without re-asking it every turn.
 */
export function selectionWeight(s?: KanaStats): number {
  if (!s || s.correct + s.wrong === 0) return 1;
  const errorRate = s.wrong / (s.correct + s.wrong);
  let weight = 0.5 + errorRate * 4;
  if (!s.lastResult) {
    const minutesSince = (Date.now() - s.lastSeen) / 60_000;
    if (minutesSince < 2) weight *= 2;
    else if (minutesSince < 15) weight *= 1.5;
  }
  return weight;
}

export function clearStats(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
