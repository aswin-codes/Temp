import { useLayoutEffect, useRef, type ReactElement } from "react";
import type { Art } from "../config";
import { REDUCED, gsap } from "../motion";
import { Cutout } from "./Cutout";

/**
 * An anime-style eyecatch between chapters: a saffron slash, a huge
 * Devanagari word stamped over it, and a character who rises into frame.
 * Purely decorative, so it is hidden from assistive tech.
 */
export function Eyecatch({
  word,
  label,
  mark,
  art,
  side,
}: {
  word: string;
  label: string;
  mark: string;
  art: Art;
  side: "left" | "right";
}): ReactElement {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ec = ref.current;
    if (!ec) return;
    const ctx = gsap.context(() => {
      const [slash, stamp, en, ch] = ["[data-ec-slash]", "[data-ec-word]", "[data-ec-en]", "[data-ec-char]"]
        .map((s) => ec.querySelector(s));
      if (REDUCED) {
        gsap.from([stamp, en, ch].filter(Boolean), {
          autoAlpha: 0, duration: 0.5, scrollTrigger: { trigger: ec, start: "top 70%", once: true },
        });
        return;
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: ec, start: "top 85%", end: "bottom 15%", scrub: 0.5 } });
      tl.fromTo(slash, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 0)
        .fromTo(stamp, { scale: 1.35, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "expo.out" }, 0.1)
        .fromTo(en, { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.3 }, 0.3)
        .to(stamp, { xPercent: -8, duration: 0.55, ease: "none" }, 0.45)
        .to(slash, { xPercent: 12, duration: 0.55, ease: "none" }, 0.45);
      if (ch) {
        const drift = side === "left" ? 1 : -1;
        tl.fromTo(ch, { yPercent: 45, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.38, ease: "expo.out" }, 0.12)
          .to(ch, { yPercent: -8, x: () => drift * window.innerWidth * 0.05, duration: 0.55, ease: "none" }, 0.45);
      }
    }, ec);
    return () => ctx.revert();
  }, [side]);

  return (
    <section ref={ref} aria-hidden="true" className="ob-eyecatch">
      <div className="ob-eyecatch__dots" />
      <div data-ec-slash className="ob-eyecatch__slash" />
      <div data-ec-word lang="hi" className="ob-eyecatch__word">
        <span>{word}</span>
        <span>{word}</span>
      </div>
      <Cutout art={art} data-ec-char className={`ob-eyecatch__char ob-eyecatch__char--${side}`} />
      <p className="ob-mono ob-muted ob-eyecatch__mark">{mark}</p>
      <p data-ec-en className="ob-eyecatch__label">{label}</p>
    </section>
  );
}
