export type ToastKind = "info" | "error" | "success" | "warning";

export type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
  image?: string;
  side: "left" | "right";
};

const MAX_VISIBLE = 10;
const DEFAULT_MS = 5000;

let nextId = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export const toasts = $state<Toast[]>([]);

/**
 * A repeat of an existing id replaces that toast instead of stacking, mirroring
 * upstream's `toastId` usage for game-state changes.
 */
export function pushToast(
  toast: Omit<Toast, "id"> & { id?: string },
  durationMs: number = DEFAULT_MS,
): void {
  const id = toast.id ?? `toast_${nextId++}`;
  const existing = toasts.findIndex((t) => t.id === id);
  const entry: Toast = { ...toast, id };

  if (existing === -1) {
    toasts.push(entry);
    while (toasts.length > MAX_VISIBLE) toasts.shift();
  } else {
    toasts[existing] = entry;
  }

  const pending = timers.get(id);
  if (pending) clearTimeout(pending);
  timers.set(
    id,
    setTimeout(() => dismissToast(id), durationMs),
  );
}

export function dismissToast(id: string): void {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) toasts.splice(index, 1);
  const pending = timers.get(id);
  if (pending) {
    clearTimeout(pending);
    timers.delete(id);
  }
}
