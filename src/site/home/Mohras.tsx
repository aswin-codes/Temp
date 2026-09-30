import { useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { CHAPTER, INTRO_IMAGE, PIECES } from "../config";
import { REDUCED, gsap } from "../motion";

/**
 * A 300vh scroll-through: the section pins while the six chess pieces fly in
 * around the box, one per sixth of the scroll, and the counter ticks up.
 */
export function Mohras(): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(REDUCED ? PIECES.length : 0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || REDUCED) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (s) => setCount(Math.min(PIECES.length, Math.floor(s.progress * 7.2))),
        },
      });
      el.querySelectorAll("[data-mohra]").forEach((p, i) =>
        tl.from(p, {
          autoAlpha: 0,
          scale: 0.4,
          rotation: i % 2 ? 50 : -50,
          x: () => (i % 2 ? 1 : -1) * window.innerWidth * 0.3,
          y: () => (i < 3 ? -1 : 1) * window.innerHeight * 0.25,
          duration: 1,
          ease: "power3.out",
        }),
      );
      tl.from("[data-mbox]", { scale: 0.9, autoAlpha: 0.4, duration: tl.duration(), ease: "none" }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="mohras" aria-labelledby="mohras-h" className="ob-mohras" data-static={REDUCED || undefined}>
      <div className="ob-mohras__pin">
        <div className="ob-mohras__meta ob-mono ob-muted">
          <span>{CHAPTER}</span>
          <span aria-hidden="true" className="ob-mohras__dash" />
          <span><span className="ob-accent">0{count}</span> / 0{PIECES.length}</span>
        </div>
        <h2 id="mohras-h" className="ob-sr">Six mohras</h2>
        <div className="ob-mohras__board">
          <div aria-hidden="true" className="ob-mohras__ring" />
          <div
            data-mbox
            role="img"
            aria-label="The sealed box of the Silver Tongue"
            className="ob-mohras__box"
            style={{ backgroundImage: `url('${INTRO_IMAGE.src}')` }}
          />
          {PIECES.map((p) => (
            <div key={p.n} data-mohra className="ob-mohra" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <span aria-hidden="true" className="ob-mohra__glyph">{p.glyph}</span>
              <span className="ob-mohra__n">{p.n}</span>
            </div>
          ))}
        </div>
        <p className="ob-mohras__line">
          A polite little puzzle guarding something <em className="ob-accent">monstrously impolite</em>.
        </p>
      </div>
    </section>
  );
}
