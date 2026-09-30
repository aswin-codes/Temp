import { BRAND, INTRO_PARAGRAPHS, PREMIERE } from "@/site/config";
import { PREMIERE_LABEL, premiereStatus } from "@/site/premiere";
import type { Visitor } from "./visitor";

/**
 * The two sign-up emails. HTML is table-based with inline styles and
 * bgcolor attributes, because that is what Gmail, Outlook and Apple Mail
 * all render; every email also has a plain-text version.
 */

export interface Email {
  subject: string;
  html: string;
  text: string;
}

// Brand colours from the site (site.css :root).
const C = {
  night: "#07061a",
  indigo: "#150f3a",
  line: "#2a2450",
  saffron: "#E8622A",
  ink: "#0B0A1A",
  paper: "#F4EEE6",
  body: "#C9C3DC",
  muted: "#A9A3C4",
};
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Consolas,'Courier New',monospace";
const HI = "'Noto Sans Devanagari','Nirmala UI','Kohinoor Devanagari',sans-serif";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const abs = (path: string) => new URL(path, BRAND.url).toString();

/** Site copy marks highlights as *word* and italic highlights as _word_. */
const plain = (s: string) => s.replace(/[*_]/g, "");
const highlighted = (s: string) =>
  esc(s)
    .replace(/\*([^*]+)\*/g, `<span style="color:${C.saffron}">$1</span>`)
    .replace(/_([^_]+)_/g, `<em style="color:${C.saffron}">$1</em>`);

// ── Fan confirmation ──────────────────────────────────────────────────────────

function premiereCopy(now: number) {
  const status = premiereStatus(now);
  const watch = PREMIERE.watchHref !== "#" ? PREMIERE.watchHref : "";
  if (status === "streaming")
    return {
      eyebrow: "NOW STREAMING",
      lead: "Episode 01 is out now.",
      promise: "We'll send you one email when Episode 02 drops. Nothing else.",
      cta: watch ? { label: "Watch Episode 01", href: watch } : null,
    };
  const when = status === "countdown" && PREMIERE_LABEL ? `on ${PREMIERE_LABEL}` : "soon";
  return {
    eyebrow: "PREMIERING SOON",
    lead: `Episode 01 of our first series drops ${when}.`,
    promise: "We'll send you one email the moment it's live. Nothing else, no drip campaign.",
    cta: null,
  };
}

const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${C.saffron}" style="border-radius:999px"><a href="${esc(href)}" style="display:inline-block;padding:15px 24px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap;color:${C.ink};text-decoration:none;border-radius:999px">${esc(label)}&nbsp;&rarr;</a></td></tr></table>`;

export function welcomeEmail(email: string, now = Date.now()): Email {
  const p = premiereCopy(now);
  const cta = p.cta ?? { label: "Visit otakubharat.com", href: BRAND.url };
  const year = new Date(now).getFullYear();
  const preheader = `${p.lead} ${p.promise}`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>You're on the list</title></head>
<body style="margin:0;padding:0;background:${C.night}" bgcolor="${C.night}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.night}">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background:${C.night}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

<tr><td style="padding:0 4px 28px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="padding-right:12px"><img src="${abs("/assets/logo-180.png")}" width="44" height="44" alt="" style="display:block;border:0;border-radius:50%"></td>
    <td style="font-family:${SANS};font-size:14px;font-weight:800;letter-spacing:3px;color:${C.paper}">OTAKU <span style="color:${C.saffron}">BHARAT</span></td>
  </tr></table>
</td></tr>

<tr><td bgcolor="${C.indigo}" style="background:${C.indigo};border:1px solid ${C.line};border-radius:16px;padding:36px 26px">
  <p style="margin:0 0 14px;font-family:${MONO};font-size:11px;letter-spacing:3px;color:${C.saffron}">&#9679;&nbsp; ${p.eyebrow}</p>
  <h1 style="margin:0 0 20px;font-family:${SANS};font-size:34px;line-height:1.05;font-weight:800;text-transform:uppercase;color:${C.paper}">You're on the&nbsp;list.</h1>
  <p style="margin:0 0 12px;font-family:${SANS};font-size:17px;line-height:1.6;color:${C.paper}">${esc(p.lead)}</p>
  <p style="margin:0 0 28px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.body}">${esc(p.promise)}</p>
  ${button(cta.label, cta.href)}
</td></tr>

<tr><td style="padding:36px 4px 8px">
  <p style="margin:0 0 6px;font-family:${MONO};font-size:11px;letter-spacing:3px;color:${C.muted}">THE STORY &middot; <span style="font-family:${HI};letter-spacing:0;color:${C.saffron}">परिचय</span></p>
  ${INTRO_PARAGRAPHS.map((para) => `<p style="margin:14px 0 0;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.body}">${highlighted(para)}</p>`).join("")}
</td></tr>

<tr><td style="padding:28px 4px 32px;border-bottom:1px solid ${C.line}">
  <p lang="hi" style="margin:0 0 6px;font-family:${HI};font-size:18px;color:${C.saffron}">छह मोहरे। एक संदूक।</p>
  <p style="margin:0;font-family:${SANS};font-size:22px;font-weight:800;text-transform:uppercase;color:${C.paper}">Be there when <span style="color:${C.saffron}">the box opens</span>.</p>
</td></tr>

<tr><td style="padding:24px 4px 0">
  <p style="margin:0 0 12px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.body}">Anime from India, in episodes short enough to finish before the chai goes cold.</p>
  <p style="margin:0 0 12px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted}">You're getting this because ${esc(email)} signed up at <a href="${BRAND.url}" style="color:${C.muted}">otakubharat.com</a>. If that wasn't you, ignore this email and you won't hear from us.</p>
  <p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:2px;color:${C.muted}">&copy; ${year} OTAKU BHARAT &middot; <span style="font-family:${HI};letter-spacing:0">${BRAND.devanagari}</span></p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

  const text = [
    "YOU'RE ON THE LIST.",
    "",
    p.lead,
    p.promise,
    "",
    `${cta.label}: ${cta.href}`,
    "",
    "THE STORY",
    ...INTRO_PARAGRAPHS.map(plain),
    "",
    "छह मोहरे। एक संदूक। Be there when the box opens.",
    "",
    "--",
    "Anime from India, in episodes short enough to finish before the chai goes cold.",
    `You're getting this because ${email} signed up at otakubharat.com. If that wasn't you, ignore this email and you won't hear from us.`,
  ].join("\n");

  return { subject: "You're on the list · Otaku Bharat Episode 01", html, text };
}

// ── Team notification ─────────────────────────────────────────────────────────

export function teamEmail(email: string, visitor: Visitor, now = Date.now()): Email {
  const when = new Date(now).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";
  const map = visitor.coords ? `https://www.google.com/maps?q=${visitor.coords}` : "";
  const rows: [string, string, string?][] = [
    ["Email", email],
    ["Signed up", when],
    ["Location", visitor.place],
    ["City", visitor.city],
    ["Region", visitor.region],
    ["Country", visitor.country],
    ["Timezone", visitor.timezone],
    ["IP address", visitor.ip],
    ...(map ? [["Map (approx.)", "Open in Google Maps", map] as [string, string, string]] : []),
  ];

  const cell = (v: string, href?: string) => (href ? `<a href="${esc(href)}">${esc(v)}</a>` : esc(v));
  const html = `<div style="font-family:Arial,sans-serif"><h2 style="font-family:Georgia,serif;font-weight:500">New Episode 01 sign-up</h2><table style="font-size:14px;border-collapse:collapse">${rows
    .map(([k, v, href]) => `<tr><td style="padding:6px 16px 6px 0;font-weight:600;color:#444;vertical-align:top">${k}</td><td style="padding:6px 0">${cell(v, href)}</td></tr>`)
    .join("")}</table><p style="font-size:12px;color:#888">Location is looked up from the IP address and is approximate.</p></div>`;
  const text = [
    "New Episode 01 sign-up",
    "",
    ...rows.map(([k, v, href]) => `${k}: ${href ?? v}`),
    "",
    "Location is looked up from the IP address and is approximate.",
  ].join("\n");

  const where = visitor.city !== "Unknown" ? ` (${visitor.city}, ${visitor.country})` : "";
  return { subject: `Otaku Bharat premiere sign-up - ${email}${where}`, html, text };
}
