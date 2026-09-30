import { useState, type HTMLAttributes, type ReactElement } from "react";
import type { Art } from "../config";

type Props = HTMLAttributes<HTMLDivElement> & {
  art: Art;
  alt?: string;
  eager?: boolean;
  [data: `data-${string}`]: string | boolean | undefined;
};

/**
 * A transparent character cut-out in a box sized to its artwork. If the file
 * is missing the whole thing is left out rather than leaving an empty frame.
 */
export function Cutout({ art, alt = "", eager, style, ...rest }: Props): ReactElement | null {
  const [missing, setMissing] = useState(false);
  if (missing) return null;
  return (
    <div aria-hidden={alt ? undefined : true} {...rest} style={{ aspectRatio: `${art.w} / ${art.h}`, ...style }}>
      <img
        src={art.src}
        alt={alt}
        width={art.w}
        height={art.h}
        loading={eager ? undefined : "lazy"}
        draggable={false}
        onError={() => setMissing(true)}
      />
    </div>
  );
}
