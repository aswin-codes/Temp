import { useLayoutEffect, useRef, type ReactElement } from "react";
import { CAST } from "../config";
import { REDUCED, gsap } from "../motion";
import { goNotify } from "../notify";
import { Cutout } from "./Cutout";

/** The last call: two characters slide in either side of the signup prompt. */
export function FinalCta(): ReactElement {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || REDUCED) return;
    const ctx = gsap.context(() => {
      const enter = { trigger: el, start: "top 85%", end: "center 60%", scrub: 0.6 };
      gsap.fromTo("[data-cta-l]", { xPercent: -80, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, ease: "power2.out", scrollTrigger: enter });
      gsap.fromTo("[data-cta-r]", { xPercent: 80, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, ease: "power2.out", scrollTrigger: { ...enter } });
      gsap.fromTo("[data-cta-ring]", { rotation: -40, scale: 0.8 }, {
        rotation: 40, scale: 1.05, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-labelledby="cta-h" className="ob-cta">
      <div aria-hidden="true" className="ob-cta__rings">
        <div data-cta-ring>
          <div />
        </div>
      </div>
      <div aria-hidden="true" className="ob-cta__cast">
        <Cutout art={CAST.ctaLeft} data-cta-l className="ob-cta__char ob-cta__char--l" />
        <Cutout art={CAST.ctaRight} data-cta-r className="ob-cta__char ob-cta__char--r" />
      </div>
      <div className="ob-cta__inner">
        <p data-reveal lang="hi" className="ob-cta__hi">छह मोहरे। एक संदूक।</p>
        <h2 id="cta-h" data-lines className="ob-cta__h">
          <span className="ob-mask"><span data-line>Be there when</span></span>
          <span className="ob-mask"><span data-line className="ob-accent">the box opens</span></span>
        </h2>
        <div data-reveal className="ob-cta__actions">
          <a
            href="#notify"
            onClick={(e) => {
              e.preventDefault();
              goNotify();
            }}
            data-cursor="link"
            className="ob-btn ob-btn--lg"
          >
            Notify me <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </section>
  );
}
