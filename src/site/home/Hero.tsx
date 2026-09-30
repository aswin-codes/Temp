import { useEffect, useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { BRAND } from "../config";
import { FINE_POINTER, REDUCED, gsap, useNarrow } from "../motion";
import { NotifyCard } from "./NotifyCard";
import { StillsCarousel } from "./StillsCarousel";
import { startDust } from "./dust";

const HEADLINE = ["INDIA'S FIRST", "SHORT-FORM"];

/**
 * Stills carousel over a violet glow, the headline, and the premiere card.
 * The entrance holds until `ready` (the preloader has split open).
 */
export function Hero({ ready }: { ready: boolean }): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const narrow = useNarrow();
  const [entered, setEntered] = useState(false);

  // Hide the animated parts before first paint so nothing flashes pre-entrance.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || ready) return;
    gsap.set(el.querySelectorAll("[data-hline],[data-hfade],[data-hcard],[data-notify],[data-speed]"), { autoAlpha: 0 });
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    const q = (s: string) => el.querySelectorAll(s);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setEntered(true) });
      tl.fromTo(q("[data-hline]"), REDUCED ? { autoAlpha: 0 } : { autoAlpha: 1, yPercent: 110 },
          REDUCED ? { autoAlpha: 1, duration: 0.5 } : { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.1 })
        .fromTo(q("[data-hfade]"), { autoAlpha: 0, y: REDUCED ? 0 : 10 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=.6")
        .fromTo(q("[data-hcard]"), { autoAlpha: 0, y: REDUCED ? 0 : 140 },
          { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: { each: 0.08, from: "center" } }, 0.1)
        .fromTo(q("[data-notify]"), { autoAlpha: 0, y: REDUCED ? 0 : 60 }, { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" }, "-=.8");
      if (REDUCED) return;
      tl.fromTo(q("[data-shimmer]"), { xPercent: 0 }, { xPercent: 360, duration: 1.3, ease: "power2.inOut" }, "-=.4");
      // Manga speed lines burst in behind the cards with a one-frame impact flash,
      // then keep shivering like a held frame.
      const speed = q("[data-speed]"), impact = q("[data-impact]");
      tl.fromTo(speed, { scale: 1.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: "expo.out" }, 0.45)
        .fromTo(impact, { opacity: 0 }, { opacity: 0.9, duration: 0.04, ease: "none" }, 0.5)
        .to(impact, { opacity: 0, duration: 0.25, ease: "steps(3)" }, 0.56);
      gsap.to(speed, {
        rotation: "random(-1.2,1.2)", duration: 0.083, ease: "steps(1)",
        repeat: -1, repeatRefresh: true, delay: 1.2,
      });
    }, el);
    return () => ctx.revert();
  }, [ready]);

  useEffect(() => {
    const cv = ref.current?.querySelector<HTMLCanvasElement>("[data-dust]");
    if (!cv || REDUCED) return;
    return startDust(cv, narrow ? 26 : 54);
  }, [narrow]);

  // Mouse parallax: the whole stage drifts and turns a little against the pointer.
  useEffect(() => {
    const hero = ref.current;
    const stage = hero?.querySelector<HTMLElement>("[data-hstage]");
    if (!hero || !stage || !FINE_POINTER || REDUCED) return;
    const opts = { duration: 1.2, ease: "power3" };
    const px = gsap.quickTo(stage, "x", opts);
    const py = gsap.quickTo(stage, "y", opts);
    const ry = gsap.quickTo(stage, "rotationY", opts);
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      px(nx * -26);
      py(ny * -14);
      ry(nx * 5);
    };
    hero.addEventListener("pointermove", onMove);
    return () => hero.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section ref={ref} data-hero aria-label="Otaku Bharat" className="ob-hero">
      <canvas data-dust aria-hidden="true" className="ob-hero__dust" />
      <div aria-hidden="true" className="ob-hero__vignette" />
      <div data-speed aria-hidden="true" className="ob-hero__speed" />
      <div data-impact aria-hidden="true" className="ob-hero__impact" />

      <div className="ob-hero__stage">
        <StillsCarousel narrow={narrow} running={entered} />
      </div>

      <div className="ob-hero__foot">
        <div className="ob-hero__copy">
          <p data-hfade lang="hi" className="ob-hero__hi">{BRAND.devanagari}</p>
          <h1 className="ob-hero__h1">
            {HEADLINE.map((line) => (
              <span key={line} className="ob-mask"><span data-hline>{line}</span></span>
            ))}
            <span className="ob-mask">
              <span data-hline>ANIME <span className="ob-accent">STUDIO</span></span>
            </span>
          </h1>
        </div>
        <NotifyCard />
      </div>
    </section>
  );
}
