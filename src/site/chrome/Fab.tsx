import { useEffect, useState, type ReactElement } from "react";
import { goNotify, useSubscribed } from "../notify";

/** Clear of the footer's base row, which the pill would otherwise cover. */
const FOOTER_CLEARANCE = 160;

/**
 * Floating "Get notified" pill, shown once the hero card has scrolled away,
 * tucked away at the very bottom of the page, and hidden for good after
 * signing up.
 */
export function Fab({ enabled }: { enabled: boolean }): ReactElement | null {
  const subscribed = useSubscribed();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY, vh = window.innerHeight;
      const atEnd = y + vh > document.documentElement.scrollHeight - FOOTER_CLEARANCE;
      setShown(y > vh * 0.9 && !atEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!enabled || !shown || subscribed) return null;
  return (
    <a
      href="#notify"
      onClick={(e) => {
        e.preventDefault();
        goNotify();
      }}
      data-cursor="link"
      aria-label="Get notified when Episode 01 drops"
      className="ob-fab"
    >
      <span>Get notified</span>
      <span aria-hidden="true" className="ob-fab__icon">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M2 4h12v8H2z M2 4l6 5 6-5" />
        </svg>
      </span>
    </a>
  );
}
