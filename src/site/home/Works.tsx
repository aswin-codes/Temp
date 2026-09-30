import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { WORKS } from "../config";
import { FINE_POINTER, REDUCED, ScrollTrigger, gsap, useNarrow } from "../motion";
import { WorkCard } from "./WorkCard";

/** Attach a clip's source the first time it is needed. */
function ensureSrc(v: HTMLVideoElement): void {
  const src = v.dataset.src;
  if (src && !v.getAttribute("src")) v.src = src;
}

/**
 * The page turns cream and the works stack up as sticky cards: each new card
 * slides over the last, which shrinks and dims behind it. Clips play on hover
 * with a mouse, or as each card arrives on touch. While the section sits under
 * the header, `onNavLight` flips the nav to its light tone.
 */
export function Works({ onNavLight }: { onNavLight: (light: boolean) => void }): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const narrow = useNarrow();
  const [playing, setPlaying] = useState(-1);
  const [active, setActive] = useState(-1);
  const [muted, setMuted] = useState(true);
  const [cc, setCC] = useState(false);

  const play = useCallback((i: number) => {
    videos.current.forEach((v, j) => {
      if (v && j !== i && !v.paused) v.pause();
    });
    const v = videos.current[i];
    if (!v) return;
    ensureSrc(v);
    v.play().catch(() => {});
  }, []);
  const pause = useCallback((i: number) => videos.current[i]?.pause(), []);
  const pauseAll = useCallback(() => videos.current.forEach((v) => v?.pause()), []);

  useEffect(() => {
    videos.current.forEach((v) => {
      for (const t of v?.textTracks ?? []) t.mode = cc ? "showing" : "hidden";
    });
  }, [cc]);

  // Keep the play state honest when a clip is paused from elsewhere, e.g. native fullscreen.
  useEffect(() => {
    const offs = videos.current.map((v, i) => {
      if (!v) return () => {};
      const on = () => setPlaying(i);
      const off = () => setPlaying((p) => (p === i ? -1 : p));
      v.addEventListener("play", on);
      v.addEventListener("pause", off);
      return () => {
        v.removeEventListener("play", on);
        v.removeEventListener("pause", off);
      };
    });
    return () => offs.forEach((f) => f());
  }, []);

  // Start fetching each clip a little before its card scrolls in.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const v = e.target.querySelector("video");
          if (v) ensureSrc(v);
          io.unobserve(e.target);
        }),
      { rootMargin: "400px 0px" },
    );
    ref.current?.querySelectorAll("[data-media]").forEach((m) => io.observe(m));
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-cream]", { opacity: 0 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: el, start: "top 92%", end: "top 35%", scrub: true },
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top 64px",
        end: "bottom 64px",
        onToggle: (s) => {
          onNavLight(s.isActive);
          if (!s.isActive) pauseAll();
        },
      });
      const cards = gsap.utils.toArray<HTMLElement>("[data-wcard]");
      cards.forEach((c, i) => {
        ScrollTrigger.create({
          trigger: c,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (s) => {
            if (!s.isActive) return;
            setActive(i);
            if (!FINE_POINTER && !REDUCED) play(i);
          },
        });
        if (i === cards.length - 1 || REDUCED) return;
        const next = { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true };
        gsap.to(c.querySelector("[data-wcard-inner]"), { scale: narrow ? 0.97 : 0.94, y: narrow ? -8 : -22, ease: "none", scrollTrigger: next });
        gsap.to(c.querySelector("[data-wdim]"), { opacity: narrow ? 0.35 : 0.55, ease: "none", scrollTrigger: { ...next } });
      });
    }, el);
    return () => {
      ctx.revert();
      onNavLight(false);
    };
  }, [onNavLight, narrow, play, pauseAll]);

  return (
    <section ref={ref} id="works" aria-labelledby="works-h" className="ob-works" data-static={REDUCED || undefined}>
      <div data-cream aria-hidden="true" className="ob-works__cream" />
      <div aria-hidden="true" className="ob-wm">
        <div data-wmdev lang="hi" className="ob-wm__word ob-wm__word--works">कृतियाँ</div>
      </div>
      <div className="ob-works__inner">
        <h2 id="works-h" data-lines className="ob-works__h">
          <span className="ob-mask"><span data-line>Selected works</span></span>
        </h2>
        <div className="ob-works__meta ob-mono">
          <span>OTAKU BHARAT COLLECTION</span>
          <span data-rule aria-hidden="true" />
          <span className="ob-works__count">({String(WORKS.length).padStart(2, "0")})</span>
        </div>
        <ol className="ob-works__stack">
          {WORKS.map((w, i) => (
            <WorkCard
              key={w.file}
              ref={(v) => {
                videos.current[i] = v;
              }}
              work={w}
              i={i}
              active={active}
              playing={playing === i}
              muted={muted}
              cc={cc}
              onToggle={() => (playing === i ? pause(i) : play(i))}
              onPlay={() => play(i)}
              onPause={() => pause(i)}
              onToggleMute={() => setMuted((m) => !m)}
              onToggleCC={() => setCC((c) => !c)}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
