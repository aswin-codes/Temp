import { useEffect, useRef, useState, type ReactElement } from "react";
import { START_STILL, STILLS } from "../config";
import { REDUCED } from "../motion";

const COUNT = STILLS.length;
const DWELL = 5200;
const SWIPE = 45;

/** Signed distance from the focused still, wrapped to -2..2. */
const offsetOf = (i: number, idx: number) => {
  const o = (((i - idx) % COUNT) + COUNT) % COUNT;
  return o > COUNT / 2 ? o - COUNT : o;
};

/**
 * Five 2:3 stills in a shallow 3D arc. The focused one plays its clip with a
 * slow Ken Burns push; autoplay pauses while the carousel is hovered, focused
 * or dragged. The pause button stops all of it: slides, clip and push.
 * `running` holds autoplay until the hero entrance has finished.
 */
export function StillsCarousel({
  narrow,
  running,
}: {
  narrow: boolean;
  running: boolean;
}): ReactElement {
  const [idx, setIdx] = useState(START_STILL);
  const [auto, setAuto] = useState(!REDUCED);
  const hold = useRef({ hover: false, focus: false, drag: false });
  const drag = useRef<{ x: number } | null>(null);
  const suppressClick = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  const go = (d: number) => setIdx((i) => (i + d + COUNT * 10) % COUNT);

  useEffect(() => {
    if (!running || !auto) return;
    const id = setInterval(() => {
      const h = hold.current;
      if (!h.hover && !h.focus && !h.drag && !document.hidden) go(1);
    }, DWELL);
    return () => clearInterval(id);
  }, [running, auto]);

  const autoOn = auto && !REDUCED;

  // Paused: stop the focused clip, and freeze its Ken Burns push where it is
  // rather than letting it ease back. Also applies to a still focused while paused.
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      if (autoOn) v.play().catch(() => {});
      else v.pause();
    }
    const m = mediaRef.current;
    if (!m || autoOn) return;
    m.style.transform = getComputedStyle(m).transform;
    m.style.transition = "none";
    return () => {
      m.style.transform = "";
      m.style.transition = "";
    };
  }, [autoOn, idx]);

  return (
    <>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Film stills. Use left and right arrow keys to browse."
        tabIndex={0}
        className="ob-stills"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          go(e.key === "ArrowRight" ? 1 : -1);
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX };
          hold.current.drag = true;
        }}
        onPointerUp={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          drag.current = null;
          hold.current.drag = false;
          if (Math.abs(dx) <= SWIPE) return;
          go(dx < 0 ? 1 : -1);
          suppressClick.current = true;
          setTimeout(() => (suppressClick.current = false), 60);
        }}
        onPointerCancel={() => {
          drag.current = null;
          hold.current.drag = false;
        }}
        onMouseEnter={() => (hold.current.hover = true)}
        onMouseLeave={() => (hold.current.hover = false)}
        onFocus={() => (hold.current.focus = true)}
        onBlur={() => (hold.current.focus = false)}
      >
        <div data-hstage className="ob-stills__stage">
          {STILLS.map((still, i) => {
            const o = offsetOf(i, idx);
            const a = Math.abs(o);
            const active = a === 0;
            return (
              <div key={still.poster + i} data-hcard className="ob-stills__anchor">
                <div
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Still ${i + 1} of ${COUNT}: ${still.alt}`}
                  aria-hidden={!active}
                  data-cursor="card"
                  className="ob-still"
                  onClick={() => !suppressClick.current && o && go(o)}
                  style={{
                    transform: `translate(-50%,-50%) translateX(${o * (narrow ? 74 : 66)}%) translateZ(${-a * 140}px) rotateY(${REDUCED ? 0 : -o * 12}deg) scale(${1 - a * 0.13})`,
                    opacity: a === 2 ? 0.55 : 1,
                    filter: REDUCED || narrow || active ? "none" : `blur(${a * 1.5}px)`,
                  }}
                >
                  <div ref={active ? mediaRef : undefined} className="ob-still__media" data-kb={active && autoOn ? "" : undefined}>
                    <img src={still.poster} alt="" draggable={false} loading={a > 1 ? "lazy" : "eager"} />
                    {active && still.video && (
                      <video ref={videoRef} src={still.video} poster={still.poster} autoPlay={autoOn} muted loop playsInline preload="auto" />
                    )}
                  </div>
                  <div aria-hidden="true" className="ob-still__dim" style={{ opacity: active ? 0 : a === 1 ? 0.42 : 0.68 }} />
                  <span aria-hidden="true" className="ob-still__n">0{i + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ob-stills__controls">
        <button type="button" onClick={() => go(-1)} aria-label="Previous still" data-cursor="link">←</button>
        <span aria-live="polite" className="ob-stills__count">
          <span>0{idx + 1}</span> / 0{COUNT}
        </span>
        <button type="button" onClick={() => go(1)} aria-label="Next still" data-cursor="link">→</button>
        {!REDUCED && (
          <button
            type="button"
            onClick={() => setAuto((v) => !v)}
            aria-label={autoOn ? "Pause stills and video" : "Play stills and video"}
            aria-pressed={!autoOn}
            data-cursor="link"
            className="ob-stills__auto"
          >
            {autoOn ? "❚❚" : "▶︎"}
          </button>
        )}
      </div>
    </>
  );
}
