import { useSyncExternalStore } from "react";
import { scrollToSelector } from "../scroll";

/**
 * Whether this visitor has joined the premiere list, shared so the header
 * pill and the floating button can change once the hero card succeeds.
 */
let subscribed = false;
const listeners = new Set<() => void>();

export function markSubscribed(): void {
  subscribed = true;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

export const useSubscribed = (): boolean => useSyncExternalStore(subscribe, () => subscribed);

/** Scroll back up to the hero signup card and put the cursor in the email field. */
export function goNotify(): void {
  scrollToSelector("#notify", -120, 1.8);
  setTimeout(() => document.getElementById("ob-email")?.focus({ preventScroll: true }), 1500);
}
