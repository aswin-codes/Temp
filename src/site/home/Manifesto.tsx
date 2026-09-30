import { useLayoutEffect, useRef, type ReactElement } from "react";
import { BEATS, CAST, MANIFESTO, MANIFESTO_ACCENT } from "../config";
import { REDUCED, gsap } from "../motion";
import { Cutout } from "./Cutout";

const WORDS = MANIFESTO.split(" ");

/** Why short-form: one line read in word by word, then three beats. */
export function Manifesto(): ReactElement {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || REDUCED) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-mw]", { opacity: 0.12, y: 18 }, {
        opacity: 1, y: 0, ease: "none", stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 75%", end: "center 45%", scrub: 0.6 },
      });
      gsap.from("[data-beat]", {
        y: 40, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.12,
        scrollTrigger: { trigger: "[data-beat]", start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-labelledby="mf-h" className="ob-manifesto">
      <div className="ob-wrap ob-manifesto__inner">
        <p data-reveal className="ob-mono ob-muted ob-eyebrow">
          <span className="ob-accent">00</span>WHY SHORT-FORM
        </p>
        <h2 id="mf-h" className="ob-manifesto__h">
          {WORDS.map((w, i) => (
            <span key={i} data-mw className={MANIFESTO_ACCENT.test(w) ? "ob-accent" : undefined}>{w}</span>
          ))}
        </h2>
        <div data-reveal className="ob-beats">
          {BEATS.map((b) => (
            <div key={b.n} data-beat>
              <p className="ob-mono ob-accent">{b.n}</p>
              <p className="ob-beats__t">{b.t}</p>
              <p className="ob-beats__d">{b.d}</p>
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="ob-manifesto__cast">
          <Cutout art={CAST.stickerB} data-sticker data-rot="-8" className="ob-sticker" style={{ transform: "rotate(-8deg)" }} />
          <Cutout art={CAST.stickerA} data-sticker data-rot="9" className="ob-sticker" style={{ transform: "rotate(9deg)" }} />
        </div>
      </div>
    </section>
  );
}
