import { useLayoutEffect, useRef, type ReactElement } from "react";
import { scrollToTop } from "../../scroll";
import { BRAND, EMAILS, SOCIALS } from "../config";
import { gsap, REDUCED } from "../motion";

const MARQUEE = `${BRAND.devanagari} • OTAKU BHARAT • SIX MOHRAS •`;

export function Footer(): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const contacts = [EMAILS.hello, EMAILS.press].filter(Boolean);

  useLayoutEffect(() => {
    const ft = ref.current;
    if (!ft || REDUCED) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-marquee]", { xPercent: -50, duration: 36, ease: "none", repeat: -1 });
      const scrub = { trigger: ft, start: "top bottom", end: "bottom bottom", scrub: 0.6 };
      gsap.fromTo("[data-fwm-a]", { xPercent: -14 }, { xPercent: 0, ease: "none", scrollTrigger: scrub });
      gsap.fromTo("[data-fwm-b]", { xPercent: 14 }, { xPercent: 0, ease: "none", scrollTrigger: { ...scrub } });
    }, ft);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={ref} aria-label="Site footer" className="ob-footer">
      <div aria-hidden="true" className="ob-footer__marquee">
        <div data-marquee>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i}>{MARQUEE}</span>
          ))}
        </div>
      </div>

      <div className="ob-footer__cols">
        <div>
          <p className="ob-footer__blurb">
            Anime from India, in episodes short enough to finish before the chai goes cold.
          </p>
        </div>
        {contacts.length > 0 && (
          <div>
            <p className="ob-kicker">CONTACT</p>
            <ul>
              {contacts.map((c) => (
                <li key={c}><a href={`mailto:${c}`} data-cursor="link">{c}</a></li>
              ))}
            </ul>
          </div>
        )}
        {SOCIALS.length > 0 && (
          <div>
            <p className="ob-kicker">FOLLOW</p>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" data-cursor="link">
                    {s.label} <span aria-hidden="true" className="ob-accent">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div aria-hidden="true" className="ob-footer__wordmark">
        <div data-fwm-a>Otaku</div>
        <div data-fwm-b className="ob-accent">Bharat</div>
      </div>

      <div className="ob-footer__base">
        <span>© {new Date().getFullYear()} OTAKU BHARAT</span>
        <a
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          data-cursor="link"
        >
          BACK TO TOP ↑
        </a>
      </div>
    </footer>
  );
}
