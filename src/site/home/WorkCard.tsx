import { forwardRef, type CSSProperties, type ReactElement } from "react";
import { workPoster, workSrc, type Work } from "../config";
import { FINE_POINTER, REDUCED } from "../motion";

export interface WorkCardProps {
  work: Work;
  i: number;
  /** The card whose number has flipped in; everything up to it shows its number. */
  active: number;
  playing: boolean;
  muted: boolean;
  cc: boolean;
  onToggle: () => void;
  onPlay: () => void;
  onPause: () => void;
  onToggleMute: () => void;
  onToggleCC: () => void;
}

const MUTED_ICON = "M11 5.5l4 5M15 5.5l-4 5";
const SOUND_ICON = "M11 5.5c1.2 1.4 1.2 3.6 0 5M13 3.5c2.3 2.5 2.3 6.5 0 9";

type LockableOrientation = ScreenOrientation & { lock?: (o: string) => Promise<void> };

/**
 * Full screen at the clip's own shape. On phones that support it, a vertical
 * clip also holds the screen upright instead of being turned sideways.
 */
function fullscreen(v: HTMLVideoElement | null, portrait: boolean): void {
  if (!v) return;
  const ios = v as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
  if (!v.requestFullscreen) {
    ios.webkitEnterFullscreen?.();
    return;
  }
  v.requestFullscreen()
    .then(() => {
      const o = screen.orientation as LockableOrientation | undefined;
      if (!o?.lock) return;
      o.lock(portrait ? "portrait" : "landscape").catch(() => {});
      const release = () => {
        if (document.fullscreenElement) return;
        o.unlock();
        document.removeEventListener("fullscreenchange", release);
      };
      document.addEventListener("fullscreenchange", release);
    })
    .catch(() => {});
}

/**
 * One sticky card in the works stack: the clip in its native frame, a small
 * control bar, and a title row whose index number flips in as it arrives.
 * The video's `src` is attached lazily by the parent as the card nears view.
 */
export const WorkCard = forwardRef<HTMLVideoElement, WorkCardProps>(function WorkCard(
  { work, i, active, playing, muted, cc, onToggle, onPlay, onPause, onToggleMute, onToggleCC },
  videoRef,
): ReactElement {
  const n = String(i + 1).padStart(2, "0");
  const digits = Array.from({ length: i + 2 }, (_, k) => String(k).padStart(2, "0"));
  const hover = FINE_POINTER && !REDUCED;
  const id = `work-${i}`;

  return (
    <li data-wcard className="ob-wcard" style={{ "--i": i } as CSSProperties}>
      <article data-wcard-inner aria-labelledby={id} className="ob-wcard__inner">
        <div data-wdim aria-hidden="true" className="ob-wcard__dim" />
        <div className="ob-wcard__stage">
          <div
            data-media={i}
            data-cursor={playing ? "pause" : "play"}
            className="ob-wcard__media"
            style={{ "--ar": work.w / work.h } as CSSProperties}
            onMouseEnter={hover ? onPlay : undefined}
            onMouseLeave={hover ? onPause : undefined}
            onClick={(e) => {
              if (!(e.target as Element).closest("button")) onToggle();
            }}
          >
            <video
              ref={videoRef}
              data-src={workSrc(work)}
              poster={workPoster(work)}
              preload="none"
              muted={muted}
              loop
              playsInline
              width={work.w}
              height={work.h}
              aria-label={work.title}
            >
              {work.captions && <track kind="captions" srcLang="en" label="English" src={work.captions} />}
            </video>
            {playing && (
              <span className="ob-wcard__live ob-mono">
                <span aria-hidden="true" />PLAYING
              </span>
            )}
            <div className="ob-wcard__controls" data-cursor="link">
              <button type="button" onClick={onToggle} aria-label={`${playing ? "Pause" : "Play"} ${work.title}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  {playing ? (
                    <>
                      <rect x="2" y="1" width="3.5" height="12" />
                      <rect x="8.5" y="1" width="3.5" height="12" />
                    </>
                  ) : (
                    <path d="M3 1.5v11l9-5.5z" />
                  )}
                </svg>
              </button>
              <button type="button" onClick={onToggleMute} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 6h3l4-3v10l-4-3H2z" />
                  <path d={muted ? MUTED_ICON : SOUND_ICON} className="ob-wcard__stroke" />
                </svg>
              </button>
              {work.captions && (
                <button type="button" onClick={onToggleCC} aria-label="Captions" aria-pressed={cc} className="ob-wcard__cc" data-on={cc || undefined}>
                  CC
                </button>
              )}
              <span className="ob-wcard__spacer" />
              <button
                type="button"
                onClick={(e) => fullscreen(e.currentTarget.closest("[data-media]")?.querySelector("video") ?? null, work.h > work.w)}
                aria-label={`Fullscreen ${work.title}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" className="ob-wcard__stroke" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <footer className="ob-wcard__foot">
          <h3 id={id} className="ob-wcard__title">{work.title}</h3>
          <div className="ob-wcard__tagline">
            <span className="ob-mono ob-accent">{work.tag}</span>
            <span aria-label={n} className="ob-wcard__flip">
              <span aria-hidden="true" style={{ transform: `translateY(-${(active >= i ? i + 1 : 0) * 1.1}em)` }}>
                {digits.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          </div>
        </footer>
      </article>
    </li>
  );
});
