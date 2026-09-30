import { useEffect, useRef, type ReactElement } from "react";
import { FINE_POINTER, REDUCED, gsap } from "../motion";

/**
 * Dot + trailing ring, mouse only. Elements opt into a hover state with
 * `data-cursor="link" | "card" | "play" | "pause"`; the last two swap the
 * ring for a labelled pill.
 */
export function Cursor(): ReactElement | null {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const on = FINE_POINTER && !REDUCED;

  useEffect(() => {
    const d = dotRef.current, r = ringRef.current, lb = labelRef.current;
    if (!on || !d || !r || !lb) return;

    gsap.set([d, r, lb], { xPercent: -50, yPercent: -50 });
    const follow = (el: HTMLElement, duration: number) => {
      const ease = duration > 0.1 ? "power3" : undefined;
      const x = gsap.quickTo(el, "x", { duration, ease });
      const y = gsap.quickTo(el, "y", { duration, ease });
      return (e: PointerEvent) => { x(e.clientX); y(e.clientY); };
    };
    const moves = [follow(d, 0.08), follow(r, 0.35), follow(lb, 0.35)];

    // Re-read the mode on every move, not just on pointerover, so it follows
    // an element whose mode changes under a still pointer (a video starting).
    let mode: string | null = null;
    const setMode = (target: EventTarget | null) => {
      const t = (target as Element | null)?.closest?.("[data-cursor]");
      const m = t?.getAttribute("data-cursor") ?? "";
      if (m === mode) return;
      mode = m;
      const pill = m === "play" || m === "pause";
      if (pill) lb.textContent = m.toUpperCase();
      const scale = pill ? 2.4 : m === "card" ? 1.9 : m === "link" ? 1.4 : 1;
      gsap.to(r, { scale, opacity: pill ? 0 : 1, duration: 0.4, ease: "power3.out" });
      gsap.to(lb, { autoAlpha: pill ? 1 : 0, scale: pill ? 1 : 0.6, duration: 0.3, ease: "power3.out" });
      gsap.to(d, { scale: m ? 0 : 1, duration: 0.25 });
    };
    const onMove = (e: PointerEvent) => {
      moves.forEach((m) => m(e));
      setMode(e.target);
    };
    const onOver = (e: PointerEvent) => setMode(e.target);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.body.classList.add("ob-cursor");
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.body.classList.remove("ob-cursor");
    };
  }, [on]);

  if (!on) return null;
  return (
    <>
      <div ref={ringRef} className="ob-cursor__ring" aria-hidden="true" />
      <div ref={dotRef} className="ob-cursor__dot" aria-hidden="true" />
      <div ref={labelRef} className="ob-cursor__label" aria-hidden="true">PLAY</div>
    </>
  );
}
