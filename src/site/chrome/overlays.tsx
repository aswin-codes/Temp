import { useEffect, useRef, type ReactElement } from "react";
import { BRAND } from "../config";
import { gsap, REDUCED } from "../motion";

/** The studio logo inside the saffron and paper rings. */
export function Emblem({ size }: { size: number }): ReactElement {
  return (
    <span className="ob-emblem" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle data-draw cx="50" cy="50" r="46" className="ob-emblem__outer" />
        <circle data-draw cx="50" cy="50" r="38" className="ob-emblem__inner" />
      </svg>
      <img data-ob src={BRAND.logo} alt="" draggable={false} />
    </span>
  );
}

/** Film grain over everything, jittered a few times a second. */
export function Grain(): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (REDUCED || !ref.current) return;
    const tween = gsap.to(ref.current, {
      x: "random(-8,8)%",
      y: "random(-8,8)%",
      duration: 0.12,
      ease: "none",
      repeat: -1,
      repeatRefresh: true,
    });
    return () => {
      tween.kill();
    };
  }, []);
  return (
    <div className="ob-grain" aria-hidden="true">
      <div ref={ref} />
    </div>
  );
}
