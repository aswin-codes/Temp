import { useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { WORLD } from "../config";
import { REDUCED, gsap, useNarrow } from "../motion";

const TOTAL = String(WORLD.length).padStart(2, "0");
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The world of 1757 as a rail of 2:3 cards. On desktop the section pins and
 * vertical scroll drives the rail sideways; on phones and under reduced
 * motion it is a swipeable row that snaps one card at a time, with arrows.
 */
export function World(): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const narrow = useNarrow();
  const [idx, setIdx] = useState(1);
  const railRef = useRef<HTMLDivElement>(null);
  const pinned = !narrow && !REDUCED;

  /** Swipe mode: move the rail by one card. */
  const step = (dir: 1 | -1) => {
    const rail = railRef.current;
    const slide = rail?.querySelector<HTMLElement>("[data-wslide]");
    if (!rail || !slide) return;
    const gap = parseFloat(getComputedStyle(slide.parentElement!).columnGap) || 0;
    rail.scrollBy({ left: dir * (slide.offsetWidth + gap), behavior: REDUCED ? "auto" : "smooth" });
  };

  useLayoutEffect(() => {
    const el = ref.current;
    const pin = el?.querySelector<HTMLElement>("[data-world-pin]");
    const track = el?.querySelector<HTMLElement>("[data-world-track]");
    const bar = el?.querySelector<HTMLElement>("[data-world-bar]");
    const rail = el?.querySelector<HTMLElement>("[data-world-scroll]");
    if (!el || !pin || !track || !bar || !rail) return;
    const n = WORLD.length;
    const progress = (p: number) => {
      gsap.set(bar, { scaleX: p });
      setIdx(Math.min(n, Math.max(1, Math.round(p * (n - 1)) + 1)));
    };

    if (!pinned) {
      const onScroll = () => {
        const max = rail.scrollWidth - rail.clientWidth;
        progress(max > 0 ? rail.scrollLeft / max : 0);
      };
      rail.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      const ctx = gsap.context(() => {
        if (!REDUCED)
          gsap.from("[data-wslide]", {
            y: 60, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.08,
            scrollTrigger: { trigger: pin, start: "top 75%", once: true },
          });
      }, el);
      return () => {
        rail.removeEventListener("scroll", onScroll);
        ctx.revert();
      };
    }

    const ctx = gsap.context(() => {
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const range = { trigger: pin, start: "top top", end: () => `+=${dist()}` };
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          ...range, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (s) => progress(s.progress),
        },
      });
      // The art inside each card slides against the rail for a little depth.
      gsap.fromTo("[data-wimg]", { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { ...range, scrub: true } });
    }, el);
    return () => ctx.revert();
  }, [pinned]);

  return (
    <section ref={ref} aria-labelledby="world-h" className="ob-world">
      <div data-world-pin className="ob-world__pin">
        <div className="ob-world__head">
          <div>
            <p className="ob-mono ob-muted ob-eyebrow">
              THE WORLD · <span lang="hi" className="ob-hi ob-accent">संसार</span>
            </p>
            <h2 id="world-h" data-lines className="ob-world__h">
              <span className="ob-mask"><span data-line>Seventeen</span></span>
              <span className="ob-mask"><span data-line className="ob-accent">fifty-seven</span></span>
            </h2>
          </div>
          <div className="ob-world__nav">
            <p className="ob-mono ob-muted ob-world__progress">
              <span className="ob-world__idx">{pad(idx)}</span> / {TOTAL}
              <span aria-hidden="true" className="ob-world__track">
                <span data-world-bar />
              </span>
            </p>
            {!pinned && (
              <div className="ob-world__arrows">
                <button type="button" onClick={() => step(-1)} disabled={idx === 1} aria-label="Previous card" data-cursor="link">←</button>
                <button type="button" onClick={() => step(1)} disabled={idx === WORLD.length} aria-label="Next card" data-cursor="link">→</button>
              </div>
            )}
          </div>
        </div>
        <div
          ref={railRef}
          data-world-scroll
          className="ob-world__rail"
          data-pinned={pinned || undefined}
          role="region"
          aria-label="The world of 1757. Swipe or use the arrows to browse."
          tabIndex={pinned ? undefined : 0}
        >
          <ul data-world-track className="ob-world__list">
            {WORLD.map((s, i) => (
              <li key={s.t} data-wslide className="ob-world__slide">
                <div data-cursor="card" className="ob-world__card" role={s.image ? "img" : undefined} aria-label={s.image ? s.alt : undefined}>
                  <div data-wimg className="ob-world__art">
                    {s.image ? (
                      <img src={s.image} alt="" loading="lazy" draggable={false} style={{ objectPosition: s.focus }} />
                    ) : (
                      <span aria-hidden="true" className="ob-world__num">{pad(i + 1)}</span>
                    )}
                  </div>
                </div>
                <div className="ob-world__meta ob-mono">
                  <span className="ob-accent">{pad(i + 1)}</span>
                  <span className="ob-muted">{s.tag}</span>
                </div>
                <p className="ob-world__t">{s.t}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
