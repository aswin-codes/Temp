import { useEffect, useRef, useState, type FormEvent, type PointerEvent, type ReactElement } from "react";
import { isEmail, subscribe } from "../../mail/subscribe";
import { PREMIERE } from "../config";
import { FINE_POINTER, REDUCED, gsap } from "../motion";
import { markSubscribed } from "../notify";
import { PREMIERE_AT, PREMIERE_LABEL, premiereStatus } from "../premiere";

type FormState = "idle" | "check" | "error" | "done";

/** Long enough for the tick to draw, so a fast response doesn't flicker. */
const MIN_CHECK_MS = 900;

const DATE_LABEL = PREMIERE_LABEL.toUpperCase();

function useNow(active: boolean): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

function countdown(ms: number) {
  const parts = [ms / 864e5, (ms / 36e5) % 24, (ms / 6e4) % 60, (ms / 1e3) % 60];
  const [d, h, m, s] = parts.map((n) => String(Math.max(0, Math.floor(n))).padStart(2, "0"));
  return [
    { v: d, u: "DAYS" },
    { v: h, u: "HRS" },
    { v: m, u: "MIN" },
    { v: s, u: "SEC" },
  ];
}

/** Episode 01 status plus the one-email signup, as a glass card in the hero. */
export function NotifyCard(): ReactElement {
  const now = useNow(PREMIERE.status === "countdown");
  const status = premiereStatus(now);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fail = (msg: string) => {
    setState("error");
    setError(msg);
    if (formRef.current && !REDUCED)
      gsap.fromTo(formRef.current, { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1,0.3)" });
    inputRef.current?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!v) return fail("Add an email first. We promise not to be clingy.");
    if (!isEmail(v)) return fail("That doesn't look like an email. Try you@email.com.");
    setState("check");
    try {
      const trap = formRef.current?.elements.namedItem("website") as HTMLInputElement | null;
      await Promise.all([subscribe(v, trap?.value), new Promise((r) => setTimeout(r, MIN_CHECK_MS))]);
      setState("done");
      markSubscribed();
    } catch {
      fail("Something broke on our side. Try again in a minute.");
    }
  };

  const magnet = (e: PointerEvent<HTMLButtonElement>) => {
    if (!FINE_POINTER || REDUCED) return;
    const b = e.currentTarget, r = b.getBoundingClientRect();
    gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: "power3.out" });
  };

  const units = countdown(PREMIERE_AT - now);
  const busy = state === "check";
  const message =
    state === "error" ? error
    : busy ? "Adding you…"
    : status === "streaming" ? "One email for Episode 02. Nothing else."
    : "One email when it drops. Nothing else.";

  return (
    <div data-notify id="notify" role="region" aria-labelledby="notify-title" className="ob-notify">
      <div data-shimmer aria-hidden="true" className="ob-notify__shimmer" />
      <p className="ob-notify__eyebrow">
        <span aria-hidden="true" />
        {status === "streaming" ? "NOW STREAMING" : "PREMIERING SOON"}
      </p>
      <h2 id="notify-title" className="ob-notify__title">
        {status === "streaming" ? "Episode 01 is out" : status === "countdown" ? "Episode 01 drops in" : "Episode 01 · Coming soon"}
      </h2>

      {status === "countdown" && (
        <>
          <div role="timer" aria-label={`${+units[0].v} days, ${+units[1].v} hours until Episode 01`} className="ob-notify__timer">
            {units.map((u) => (
              <div key={u.u}>
                <div className="ob-notify__v">{u.v}</div>
                <div className="ob-notify__u">{u.u}</div>
              </div>
            ))}
          </div>
          {DATE_LABEL && <p className="ob-notify__date">{DATE_LABEL}</p>}
        </>
      )}

      {status === "streaming" && (
        <>
          <a href={PREMIERE.watchHref} data-cursor="link" className="ob-notify__watch">
            Watch episode 01 <span aria-hidden="true">→</span>
          </a>
          <p className="ob-notify__next">Get Episode 02 in your inbox.</p>
        </>
      )}

      {state === "done" ? (
        <div role="status" aria-live="polite" className="ob-notify__done">
          <span aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" /></svg>
          </span>
          <div>
            <p>You're on the list.</p>
            <p>One email when it drops. No drip campaign.</p>
          </div>
        </div>
      ) : (
        <>
          <form ref={formRef} noValidate onSubmit={submit} className="ob-notify__form">
            <label htmlFor="ob-email" className="ob-sr">Email address</label>
            {/* Honeypot: people never see or fill this; bots that do are dropped by the API. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="ob-sr" />
            <input
              ref={inputRef}
              id="ob-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === "error") setState("idle");
              }}
              aria-invalid={state === "error"}
              aria-describedby="ob-email-msg"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy}
              data-cursor="link"
              data-busy={busy || undefined}
              onPointerMove={magnet}
              onPointerLeave={(e) => gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)" })}
            >
              <span>Notify me</span>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" /></svg>
            </button>
          </form>
          <p id="ob-email-msg" role="status" aria-live="polite" className="ob-notify__msg" data-error={state === "error" || undefined}>
            {message}
          </p>
        </>
      )}
    </div>
  );
}
