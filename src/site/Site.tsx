import { useCallback, useState, type ReactElement } from "react";
import { useSmoothScroll } from "../scroll";
import { Cursor } from "./chrome/Cursor";
import { Fab } from "./chrome/Fab";
import { Footer } from "./chrome/Footer";
import { Nav } from "./chrome/Nav";
import { Grain } from "./chrome/overlays";
import { Preloader } from "./chrome/Preloader";
import { HomePage } from "./pages";
import "./site.css";

/** The shell: preloader, header, the home page, floating signup and footer. */
export default function Site(): ReactElement {
  useSmoothScroll();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [navLight, setNavLight] = useState(false);

  const onSplit = useCallback(() => setReady(true), []);
  const onDone = useCallback(() => setLoading(false), []);

  return (
    <div className="ob-root">
      <a href="#main" className="ob-skip">Skip to content</a>
      {loading && <Preloader onSplit={onSplit} onDone={onDone} />}
      <Grain />
      <Cursor />
      <Nav light={navLight} />
      <main id="main" tabIndex={-1}>
        <HomePage ready={ready} onNavLight={setNavLight} />
      </main>
      <Fab enabled={!loading} />
      <Footer />
    </div>
  );
}
