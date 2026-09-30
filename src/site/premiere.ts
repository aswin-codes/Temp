import { PREMIERE, type PremiereStatus } from "./config";

/**
 * Episode 01 timing, shared by the hero card and the sign-up emails so both
 * always agree on the date and whether it is out yet.
 */

export const PREMIERE_AT = Date.parse(PREMIERE.date);

/** e.g. "24 Oct 2026, 18:00 IST", or "" when the date isn't set. */
export const PREMIERE_LABEL = isNaN(PREMIERE_AT)
  ? ""
  : new Date(PREMIERE_AT).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " IST";

/** The configured status, with "countdown" turning into "streaming" once the date passes. */
export function premiereStatus(now: number): PremiereStatus {
  const s = PREMIERE.status;
  if (s !== "countdown") return s;
  if (isNaN(PREMIERE_AT)) return "soon";
  return PREMIERE_AT - now <= 0 ? "streaming" : "countdown";
}
