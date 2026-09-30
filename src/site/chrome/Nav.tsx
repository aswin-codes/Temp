import { useEffect, useRef, useState, type ReactElement } from "react";
import { scrollToTop } from "../../scroll";
import { gsap, useNarrow } from "../motion";
import { goNotify, useSubscribed } from "../notify";
import { Emblem } from "./overlays";

/**
 * Fixed header: the brand and a signup pill. Transparent over the hero,
 * frosted once scrolled, cream while the cream works section is under it
 * (`light`), and tucked away while the reader scrolls down.
 */
export function Nav({ light }: { light: boolean }): ReactElement {
  const narrow = useNarrow();
  const subscribed = useSubscribed();
  const [solid, setSolid] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      const hide = y > 160 && y > last;
      last = y;
      if (hide === hidden || !headerRef.current) return;
      hidden = hide;
      gsap.to(headerRef.current, {
        yPercent: hide ? -110 : 0,
        duration: 0.5,
        ease: hide ? "power2.in" : "power3.out",
        overwrite: true,
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tone = light ? "light" : solid ? "solid" : "clear";
  const cta = subscribed ? "You're on the list" : narrow ? "Notify me" : "Get notified";

  return (
    <header ref={headerRef} className="ob-header">
      <nav aria-label="Primary" className="ob-nav" data-tone={tone}>
        <a
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="Otaku Bharat home"
          data-cursor="link"
          className="ob-nav__brand"
        >
          <Emblem size={36} />
          <span className="ob-nav__wordmark">
            OTAKU <span className="ob-nav__accent">BHARAT</span>
          </span>
        </a>
        <a
          href="#notify"
          onClick={(e) => {
            e.preventDefault();
            goNotify();
          }}
          data-cursor="link"
          className="ob-nav__cta"
        >
          <span aria-hidden="true" />
          {cta}
        </a>
      </nav>
    </header>
  );
}
