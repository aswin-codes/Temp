import { useLayoutEffect, useRef, type CSSProperties, type ReactElement } from "react";
import { scrollToSelector } from "../../scroll";
import { CAST, CHAPTER, INTRO_PARAGRAPHS } from "../config";
import { REDUCED, gsap } from "../motion";

interface Word {
  t: string;
  hl: boolean;
  italic: boolean;
}

/** Split copy into words, reading `*…*` / `_…_` highlight spans. */
function words(s: string): Word[] {
  let hl = false, italic = false;
  return s.split(" ").map((tok) => {
    if (tok[0] === "*") hl = true;
    if (tok[0] === "_") hl = italic = true;
    const word = { t: tok.replace(/[*_]/g, ""), hl, italic };
    if (tok.slice(1).includes("*")) hl = false;
    if (tok.slice(1).includes("_")) hl = italic = false;
    return word;
  });
}

const PARAGRAPHS = INTRO_PARAGRAPHS.map(words);

/**
 * The premise, read in on scroll: each word brightens as it passes, and the
 * key terms flip to saffron. The officer and his box float beside it, with a
 * glint that passes over him every few seconds.
 */
export function Intro(): ReactElement {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const hls = el.querySelectorAll("[data-hl]");
      if (REDUCED) {
        gsap.set(hls, { opacity: 1 });
        return;
      }
      const text = el.querySelector("[data-introtext]");
      gsap.fromTo(el.querySelectorAll("[data-introtext] [data-w]"), { opacity: 0.14 }, {
        opacity: 1, ease: "none", stagger: 0.05,
        scrollTrigger: { trigger: text, start: "top 72%", end: "bottom 50%", scrub: 0.6 },
      });
      hls.forEach((h) =>
        gsap.fromTo(h, { opacity: 0 }, {
          opacity: 1, ease: "none",
          scrollTrigger: { trigger: h, start: "top 68%", end: "top 56%", scrub: 0.6 },
        }),
      );
      gsap.fromTo("[data-portrait]", { yPercent: 7 }, {
        yPercent: -7, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.fromTo("[data-sweep]", { xPercent: -150 }, {
        xPercent: 320, duration: 2.2, ease: "power2.inOut", repeat: -1, repeatDelay: 3.2,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="intro" aria-labelledby="intro-h" className="ob-intro">
      <div aria-hidden="true" className="ob-wm">
        <div data-wmdev lang="hi" className="ob-wm__word ob-wm__word--intro">परिचय</div>
      </div>
      <div className="ob-intro__grid">
        <div data-introtext>
          <h2 id="intro-h" data-lines className="ob-intro__h">
            <span className="ob-mask"><span data-line>Introduction</span></span>
          </h2>
          <div className="ob-intro__sub">
            <span lang="hi">परिचय</span>
            <span data-rule aria-hidden="true" />
          </div>
          {PARAGRAPHS.map((p, i) => (
            <p key={i} className="ob-intro__p">
              {p.map((w, j) => (
                <span key={j} data-w className="ob-intro__w" style={w.italic ? { fontStyle: "italic" } : undefined}>
                  {w.t}
                  {w.hl && <span data-hl aria-hidden="true">{w.t}</span>}
                </span>
              ))}
            </p>
          ))}
          <div data-reveal className="ob-intro__cta">
            <a
              href="#mohras"
              onClick={(e) => {
                e.preventDefault();
                scrollToSelector("#mohras");
              }}
              data-cursor="link"
              className="ob-btn"
            >
              Story <span aria-hidden="true">→</span>
            </a>
            <span className="ob-mono ob-muted">{CHAPTER}</span>
          </div>
        </div>

        <figure data-reveal className="ob-intro__fig">
          <div data-portrait className="ob-intro__portrait">
            <div aria-hidden="true" className="ob-intro__glow" />
            <div aria-hidden="true" className="ob-intro__shadow" />
            <div
              data-float
              className="ob-intro__officer"
              style={{ aspectRatio: `${CAST.officer.w} / ${CAST.officer.h}`, "--art": `url(${CAST.officer.src})` } as CSSProperties}
            >
              <img
                src={CAST.officer.src}
                width={CAST.officer.w}
                height={CAST.officer.h}
                alt="A British officer in a red coat holding the ornate chess-patterned box."
                loading="lazy"
              />
              <div aria-hidden="true" className="ob-intro__glint">
                <div data-sweep />
              </div>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
