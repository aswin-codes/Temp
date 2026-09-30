import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isEmail } from "@/mail/subscribe";
import { teamEmail, welcomeEmail, type Email } from "./emails";
import { visitorOf } from "./visitor";

// Resend's SDK needs the Node.js runtime.
export const runtime = "nodejs";

/**
 * Premiere list sign-ups. The hero's "Notify me" form posts `{ email }`.
 * The team gets the sign-up with the visitor's approximate location, and the
 * fan gets a "you're on the list" confirmation. Same origin, so no CORS.
 */

const MAX_EMAIL = 254;

const list = (v = "") =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/** Send one email; resolves to an error description, or null on success. */
async function send(resend: Resend, msg: Email & { from: string; to: string[]; replyTo?: string }) {
  try {
    const { error } = await resend.emails.send(msg);
    return error ? JSON.stringify(error) : null;
  } catch (err) {
    return String(err);
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  // Team recipient(s), comma-separated.
  const team = list(process.env.OTAKU_NOTIFY_TO_EMAIL);
  // Must be on a domain verified in Resend: the shared onboarding sender only
  // delivers to the Resend account owner, so fans would never get their email.
  const from = process.env.OTAKU_NOTIFY_FROM_EMAIL || "Otaku Bharat <onboarding@resend.dev>";

  if (!apiKey || team.length === 0) {
    console.error("notify: missing RESEND_API_KEY or OTAKU_NOTIFY_TO_EMAIL");
    return fail(500, "Email service not configured.");
  }

  let body: { email?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid request.");
  }

  // Honeypot: the form keeps a hidden `website` field empty. Bots that fill
  // it get a normal-looking success and nothing is sent.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > MAX_EMAIL || !isEmail(email)) {
    return fail(400, "A valid email is required.");
  }

  const resend = new Resend(apiKey);

  // The team email is the record of the sign-up, so it has to land.
  const teamError = await send(resend, { from, to: team, replyTo: email, ...teamEmail(email, visitorOf(req)) });
  if (teamError) {
    console.error("notify: team email failed", teamError);
    return fail(502, "Could not sign you up. Please try again.");
  }

  // The fan is on the list either way, so a failed confirmation is logged, not shown.
  const welcomeError = await send(resend, { from, to: [email], ...welcomeEmail(email) });
  if (welcomeError) console.error("notify: confirmation email failed", welcomeError);

  return NextResponse.json({ ok: true });
}
