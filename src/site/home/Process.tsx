import { useLayoutEffect, useRef, type ReactElement } from "react";
import { CAST, STEPS } from "../config";
import { REDUCED, ScrollTrigger, gsap } from "../motion";
import { Cutout } from "./Cutout";

/**
 * From script to scroll: a sticky heading beside four steps on a timeline
 * that draws itself down as you read, lighting each dot as it passes.
 */
export function Process(): ReactElement {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (!REDUCED)
        gsap.fromTo("[data-steps-line]", { scaleY: 0 }, {
          scaleY: 1, ease: "none",
          scrollTrigger: { trigger: "[data-steps]", start: "top 60%", end: "bottom 70%", scrub: 0.5 },
        });
      el.querySelectorAll<HTMLElement>("[data-step]").forEach((st) => {
        const dot = st.querySelector("[data-step-dot]");
        const img = st.querySelector("[data-step-img]");
        ScrollTrigger.create({
          trigger: st,
          start: "top 62%",
          onEnter: () => void gsap.to(dot, { backgroundColor: "#e8622a", scale: 1.3, duration: 0.4 }),
          onLeaveBack: () => void gsap.to(dot, { backgroundColor: "#07061a", scale: 1, duration: 0.4 }),
        });
        gsap.from(st.children, {
          y: REDUCED ? 0 : 30, autoAlpha: 0, duration: REDUCED ? 0.5 : 0.9, ease: "expo.out", stagger: 0.07,
          scrollTrigger: { trigger: st, start: "top 80%", once: true },
        });
        if (img && !REDUCED)
          gsap.fromTo(img, { clipPath: "inset(0% 100% 0% 0%)", scale: 1.15 }, {
            clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.4, ease: "expo.inOut",
            scrollTrigger: { trigger: img, start: "top 85%", once: true },
          });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-labelledby="pc-h" className="ob-process">
      <div className="ob-wrap ob-process__grid">
        <div className="ob-process__head">
          <p data-reveal className="ob-mono ob-muted ob-eyebrow">
            FROM SCRIPT TO SCROLL · <span lang="hi" className="ob-hi ob-accent">प्रक्रिया</span>
          </p>
          <h2 id="pc-h" data-lines className="ob-process__h">
            <span className="ob-mask"><span data-line>How an</span></span>
            <span className="ob-mask"><span data-line>episode</span></span>
            <span className="ob-mask"><span data-line className="ob-accent">gets made</span></span>
          </h2>
          <p data-reveal className="ob-process__lede">
            Everything happens in-house, and every step is planned for a screen held upright.
          </p>
          <Cutout art={CAST.stickerB} data-sticker data-rot="6" className="ob-sticker ob-process__sticker" style={{ transform: "rotate(6deg)" }} />
        </div>
        <div data-steps className="ob-steps">
          <span aria-hidden="true" className="ob-steps__rail" />
          <span data-steps-line aria-hidden="true" className="ob-steps__rail ob-steps__rail--on" />
          <ol className="ob-steps__list">
            {STEPS.map((p) => (
              <li key={p.n} data-step className="ob-step">
                <span data-step-dot aria-hidden="true" className="ob-step__dot" />
                <p className="ob-mono ob-accent">{p.n} · {p.k}</p>
                <h3 className="ob-step__t">{p.t}</h3>
                <p className="ob-step__d">{p.d}</p>
                <div className="ob-step__frame" aria-hidden={p.image ? undefined : true}>
                  <div data-step-img className="ob-step__img">
                    {p.image ? (
                      <img src={p.image} alt={p.alt ?? ""} loading="lazy" />
                    ) : (
                      <span className="ob-step__word">{p.k}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
