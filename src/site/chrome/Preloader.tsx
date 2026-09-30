import { useLayoutEffect, useRef, type ReactElement } from "react";
import { gsap, REDUCED } from "../motion";
import { Emblem } from "./overlays";

/**
 * Emblem stroke → wordmark wipe → the screen splits open. About 1.8s.
 * `onSplit` fires as the halves start to part so the hero can begin its
 * entrance underneath; `onDone` once the preloader can unmount.
 */
export function Preloader({
  onSplit,
  onDone,
}: {
  onSplit: () => void;
  onDone: () => void;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (REDUCED) {
      onSplit();
      const t = gsap.to(el, { autoAlpha: 0, duration: 0.4, onComplete: onDone });
      return () => {
        t.kill();
      };
    }
    const q = (s: string) => el.querySelectorAll(s);
    const length = (_: number, t: SVGGeometryElement) => t.getTotalLength();
    const tl = gsap
      .timeline({ onComplete: onDone })
      .fromTo(
        q("[data-draw]"),
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut", stagger: 0.08 },
      )
      .fromTo(q("[data-ob]"), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.3 }, "-=.3")
      .fromTo(
        q("[data-wm]"),
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.inOut" },
        "-=.15",
      )
      .to(q("[data-pre-inner]"), { autoAlpha: 0, duration: 0.2 }, "+=.1")
      .addLabel("split")
      .to(q('[data-half="t"]'), { yPercent: -100, duration: 0.6, ease: "expo.inOut" }, "split")
      .to(q('[data-half="b"]'), { yPercent: 100, duration: 0.6, ease: "expo.inOut" }, "split")
      .add(onSplit, "split+=.15");
    return () => {
      tl.kill();
    };
    // Runs once; the callbacks are stable setters from Site.
  }, []);

  return (
    <div ref={ref} className="ob-pre" role="status" aria-label="Loading Otaku Bharat">
      <div data-half="t" className="ob-pre__half ob-pre__half--t" />
      <div data-half="b" className="ob-pre__half ob-pre__half--b" />
      <div data-pre-inner className="ob-pre__inner">
        <Emblem size={96} />
        <div data-wm className="ob-pre__wordmark">
          OTAKU <span className="ob-accent">BHARAT</span>
        </div>
      </div>
    </div>
  );
}
