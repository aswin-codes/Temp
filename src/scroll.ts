import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, REDUCED } from "./site/motion";

/**
 * The page's one Lenis instance, shared so anchor buttons can drive the scroll
 * without a prop chain. Null under reduced motion, where the browser owns it.
 */
let instance: Lenis | null = null;

export function useSmoothScroll(): void {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Webfonts reflow the text after first paint; re-measure every trigger.
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());

    if (REDUCED) {
      return () => {
        cancelled = true;
      };
    }

    ScrollTrigger.config({ ignoreMobileResize: true });
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    // Lenis drives the frame loop; GSAP's own lag smoothing would fight it.
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelled = true;
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);
}

/** Smooth-scroll to a selector, `offset` px from its top. No-op if nothing matches. */
export function scrollToSelector(selector: string, offset = 0, duration = 1.6): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (instance) {
    instance.scrollTo(el, { offset, duration });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: REDUCED ? "auto" : "smooth" });
}

export function scrollToTop(): void {
  if (instance) {
    instance.scrollTo(0, { duration: 1.4 });
    return;
  }
  window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
}
