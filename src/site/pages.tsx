import { useRef, type ReactElement } from "react";
import { CAST } from "./config";
import { Eyecatch } from "./home/Eyecatch";
import { FinalCta } from "./home/FinalCta";
import { Hero } from "./home/Hero";
import { Intro } from "./home/Intro";
import { Manifesto } from "./home/Manifesto";
import { Mohras } from "./home/Mohras";
import { Process } from "./home/Process";
import { Works } from "./home/Works";
import { World } from "./home/World";
import { useAmbient, useReveals } from "./motion";

export function HomePage({
  ready,
  onNavLight,
}: {
  ready: boolean;
  onNavLight: (light: boolean) => void;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useReveals(ref);
  useAmbient(ref);
  return (
    <div ref={ref}>
      <Hero ready={ready} />
      <Manifesto />
      <Intro />
      <Eyecatch word="मोहरे" label="Chapter 01 · Six Mohras" mark="EYECATCH · A" art={CAST.eyecatchA} side="right" />
      <Mohras />
      <Eyecatch word="१७५७" label="The World · 1757" mark="EYECATCH · B" art={CAST.eyecatchB} side="left" />
      <World />
      <Works onNavLight={onNavLight} />
      <Process />
      <FinalCta />
    </div>
  );
}
