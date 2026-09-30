import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

const query = (q: string) =>
  typeof window !== "undefined" && window.matchMedia(q).matches;

/** Read once per page load; the whole motion system is chosen at boot. */
export const REDUCED = query("(prefers-reduced-motion: reduce)");

/** A mouse or trackpad — the only case that gets the custom cursor. */
export const FINE_POINTER = query("(hover: hover) and (pointer: fine)");

export function useMedia(q: string): boolean {
  const [match, setMatch] = useState(() => query(q));
  useEffect(() => {
    const m = window.matchMedia(q);
    const read = () => setMatch(m.matches);
    read();
    m.addEventListener("change", read);
    return () => m.removeEventListener("change", read);
  }, [q]);
  return match;
}

export const useNarrow = () => useMedia("(max-width: 859px)");

/**
 * The shared entrance vocabulary, scoped to one subtree:
 * - `[data-reveal]` rises and fades in,
 * - `[data-lines]` slides each child `[data-line]` up out of its mask,
 * - `[data-rule]` draws a hairline from the left.
 */
export function useReveals(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const once = (el: Element, start = "top 90%") => ({
        trigger: el,
        start,
        once: true,
      });
      root.querySelectorAll("[data-reveal]").forEach((el) =>
        gsap.from(el, {
          y: REDUCED ? 0 : 36,
          autoAlpha: 0,
          duration: REDUCED ? 0.5 : 1,
          ease: "power3.out",
          scrollTrigger: once(el),
        }),
      );
      root.querySelectorAll("[data-lines]").forEach((el) =>
        gsap.from(
          el.querySelectorAll("[data-line]"),
          REDUCED
            ? { autoAlpha: 0, duration: 0.5, scrollTrigger: once(el) }
            : {
                yPercent: 110,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.09,
                scrollTrigger: once(el),
              },
        ),
      );
      if (!REDUCED)
        root.querySelectorAll("[data-rule]").forEach((el) =>
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.3,
            ease: "expo.inOut",
            scrollTrigger: once(el, "top 92%"),
          }),
        );
    }, root);
    return () => ctx.revert();
  }, [ref]);
}

/**
 * Ambient scroll motion, scoped to one subtree. All of it is off under
 * reduced motion:
 * - `[data-wmdev]` Devanagari watermarks drift left across their section,
 * - `[data-sticker]` cut-outs pop up into place (`data-rot` is the resting
 *   angle), then keep rising a little as they leave,
 * - `[data-float]` bobs gently forever.
 */
export function useAmbient(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || REDUCED) return;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-wmdev]").forEach((w) =>
        gsap.fromTo(w, { xPercent: 0 }, {
          xPercent: -18, ease: "none",
          scrollTrigger: { trigger: w.closest("section"), start: "top bottom", end: "bottom top", scrub: true },
        }),
      );
      root.querySelectorAll<HTMLElement>("[data-sticker]").forEach((s, i) => {
        const r = Number(s.dataset.rot) || 0;
        const swing = i % 2 ? 1 : -1;
        gsap.fromTo(s, { y: 140, rotation: r + swing * 28, scale: 0.4, autoAlpha: 0 }, {
          y: 0, rotation: r, scale: 1, autoAlpha: 1, ease: "back.out(2.2)",
          scrollTrigger: { trigger: s, start: "top 100%", end: "top 62%", scrub: 0.5 },
        });
        gsap.to(s, {
          yPercent: -22, rotation: r - swing * 6, ease: "none", immediateRender: false,
          scrollTrigger: { trigger: s, start: "top 62%", end: "bottom top", scrub: true },
        });
      });
      gsap.to(root.querySelectorAll("[data-float]"), {
        y: -10, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1,
      });
    }, root);
    return () => ctx.revert();
  }, [ref]);
}
