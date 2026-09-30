/**
 * Content for the site, kept out of the markup so components read as layout.
 * Anything marked TODO still needs a real value from the team before launch;
 * empty values are hidden rather than rendered as placeholders.
 */

export const BRAND = {
  name: "Otaku Bharat",
  devanagari: "ओटाकू भारत",
  logo: "/assets/logo.png",
  url: "https://www.otakubharat.com/",
} as const;

// ── Premiere ──────────────────────────────────────────────────────────────────

/** "countdown" falls through to "streaming" on its own once the date passes. */
export type PremiereStatus = "countdown" | "streaming" | "soon";

export const PREMIERE = {
  status: "countdown" as PremiereStatus,
  date: "2026-10-24T18:00:00+05:30",
  /** TODO: streaming URL for Episode 01 once it is live. */
  watchHref: "#",
};

// ── Character art ─────────────────────────────────────────────────────────────

export interface Art {
  src: string;
  /** Native size, so the box is reserved before the PNG arrives. */
  w: number;
  h: number;
}

const cast = (n: number, w: number, h: number): Art => ({ src: `/assets/cast/char${n}.png`, w, h });

export const CAST = {
  officer: cast(3, 208, 546),
  eyecatchA: cast(1, 410, 512),
  eyecatchB: cast(4, 463, 539),
  stickerA: cast(5, 314, 490),
  stickerB: cast(8, 300, 493),
  ctaLeft: cast(7, 300, 521),
  ctaRight: cast(2, 294, 546),
};

// ── Hero stills ───────────────────────────────────────────────────────────────

export interface Still {
  poster: string;
  /** Looping clip played while the still is in focus. */
  video?: string;
  alt: string;
}

const clip = (n: number): Still => ({
  poster: `/assets/videos/posters/video${n}.webp`,
  video: `/assets/videos/video${n}.mp4`,
  alt: "Still from Otaku Bharat's first series",
});

export const STILLS: Still[] = [
  clip(1),
  clip(4),
  // The carousel opens on index 2, whose poster index.html preloads.
  {
    ...clip(2),
    alt: "A redcoat officer half-hidden behind a figure in the foreground",
  },
  { ...clip(3), alt: "A red-skinned warrior in a garland, sword drawn" },
  {
    poster: "/assets/intro-image.png",
    alt: "A redcoat officer holding the sealed box of the Silver Tongue",
  },
];

export const START_STILL = 2;

// ── Manifesto ─────────────────────────────────────────────────────────────────

export const MANIFESTO = "Eight seconds to hook you. Ninety to keep you up at night.";
/** Words in the manifesto set in saffron. */
export const MANIFESTO_ACCENT = /Ninety|night/;

export const BEATS = [
  { n: "01", t: "Made vertical", d: "Framed for 9:16 from the first thumbnail. Never cropped down from widescreen." },
  { n: "02", t: "Built to binge", d: "Every episode ends on a hook sharp enough that the next one feels owed." },
  { n: "03", t: "Written to rewatch", d: "The clues are in plain sight. Viewers usually spot them on the second watch." },
];

// ── Introduction ──────────────────────────────────────────────────────────────

/**
 * `*word*` highlights, `_word_` highlights in italics. Markers may span
 * several words: `*Silver Tongue*`.
 */
export const INTRO_PARAGRAPHS = [
  "In 1757, somewhere between thunder, betrayal, and imperial ambition, a queen acquires a rather inconveniently powerful artefact known as the *Silver Tongue*: a device that doesn’t conquer nations with cannons, but with conversation. Kings sign what they shouldn’t. Generals obey what they shouldn’t. Empires expand and India comes under British Raj.",
  "The Tongue is eventually locked away inside its box that only opens with six specific chess pieces called _mohras._ A polite little puzzle guarding something monstrously impolite.",
];

export const INTRO_IMAGE = {
  src: "/assets/intro-image.png",
  alt: "A redcoat officer holding the sealed box of the Silver Tongue",
};

export const CHAPTER = "CHAPTER 01 · SIX MOHRAS";

// ── Six mohras ────────────────────────────────────────────────────────────────

export const PIECES = [
  { glyph: "♚︎", n: "I", x: 50, y: 10 },
  { glyph: "♛︎", n: "II", x: 84.6, y: 30 },
  { glyph: "♜︎", n: "III", x: 84.6, y: 70 },
  { glyph: "♝︎", n: "IV", x: 50, y: 90 },
  { glyph: "♞︎", n: "V", x: 15.4, y: 70 },
  { glyph: "♟︎", n: "VI", x: 15.4, y: 30 },
];

// ── The world of 1757 ─────────────────────────────────────────────────────────

export interface WorldSlide {
  t: string;
  tag: string;
  /** TODO: 2:3 concept art. Slides without one show their number instead. */
  image?: string;
  /** object-position for the art, so faces stay in frame. */
  focus?: string;
  alt: string;
}

export const WORLD: WorldSlide[] = [
  { t: "Bengal, 1757", tag: "SETTING", image: "/assets/world/bengal-1757.webp", alt: "A storm over the river at dusk, a palace skyline and tall ships on the water" },
  { t: "The Queen", tag: "CHARACTER", image: "/assets/videos/posters/video1.webp", focus: "50% 30%", alt: "The Queen in a black gown, arms spread before stained-glass windows" },
  { t: "The Silver Tongue", tag: "ARTEFACT", image: "/assets/world/silver-tongue.webp", focus: "50% 70%", alt: "A ring of engraved silver on a velvet-topped box between two candles" },
  { t: "The Court", tag: "LOCATION", image: "/assets/videos/posters/video4.webp", focus: "70% 60%", alt: "The Queen on her throne in a hall of tall stained-glass windows" },
  { t: "The Officer", tag: "CHARACTER", image: INTRO_IMAGE.src, focus: "50% 0%", alt: INTRO_IMAGE.alt },
  { t: "The Six Mohras", tag: "ARTEFACT", image: "/assets/world/six-mohras.webp", focus: "40% 60%", alt: "Ivory chess pieces standing in a circle on dark cloth, one lit by a candle" },
  { t: "The Treaty Room", tag: "LOCATION", image: "/assets/world/treaty-room.webp", focus: "50% 25%", alt: "The officer holding the box at the head of a long table strewn with scrolls and wax seals" },
];

// ── Works ─────────────────────────────────────────────────────────────────────

export interface Work {
  file: string;
  title: string;
  tag: string;
  /** Native frame size; sets the card's media box before metadata loads. */
  w: number;
  h: number;
  /** Optional WebVTT captions. The CC toggle only shows when a work has them. */
  captions?: string;
}

export const WORKS: Work[] = [
  { file: "work-03.mp4", title: "Birthday Special", tag: "SHORT FILM", w: 720, h: 1280 },
  { file: "work-02.mp4", title: "After Effects Journey", tag: "MOTION", w: 720, h: 1280 },
  { file: "work-05.mp4", title: "The Divine Lord Krishna", tag: "MYTHOLOGY", w: 1280, h: 720 },
  { file: "work-04.mp4", title: "See You Tomorrow", tag: "ANIMATION", w: 1280, h: 720 },
  { file: "work-06.mp4", title: "Student Advertisement", tag: "COMMERCIAL", w: 1276, h: 720 },
  { file: "work-07.mp4", title: "Disney Movie Tribute", tag: "TRIBUTE", w: 1080, h: 608 },
  { file: "work-01.mp4", title: "Ben 10 Fan Animation", tag: "FAN WORK", w: 1080, h: 1920 },
];

export const workSrc = (work: Work) => `/our_works/${work.file}`;
export const workPoster = (work: Work) =>
  `/our_works/posters/${work.file.replace(".mp4", ".webp")}`;

// ── Process ───────────────────────────────────────────────────────────────────

export interface Step {
  n: string;
  k: string;
  t: string;
  d: string;
  /** 16:9 still. Steps without one show their keyword instead. */
  image?: string;
  alt?: string;
}

export const STEPS: Step[] = [
  {
    n: "01", k: "SCRIPT", t: "Write it short",
    d: "Every episode starts as one page, and every line has to justify the seconds it takes up.",
    image: "/assets/process/script.webp", alt: "A marked-up script page under a desk lamp, beside chai and a phone",
  },
  {
    n: "02", k: "BOARD", t: "Frame it tall",
    d: "Boards and animatics are composed for 9:16, with the main action kept in the thumb-safe middle of the screen.",
    image: "/assets/process/board.webp", alt: "Pencil storyboards of a queen, an officer and chess pieces pinned along a wooden wall",
  },
  {
    n: "03", k: "ANIMATE", t: "Move it with care",
    d: "Key animation, in-betweens and backgrounds, drawn in-house by a small team.",
    image: "/assets/process/animate.webp", alt: "A hand sketching a character on a pen display",
  },
  {
    n: "04", k: "SCORE", t: "Make it land",
    d: "Sound, score and a final mix tuned for phone speakers, since that is how most people will hear it.",
    image: "/assets/process/score.webp", alt: "A night-lit studio with a mixing desk, keyboard and tabla, and a phone playing back the cut",
  },
];

// ── Contact ───────────────────────────────────────────────────────────────────

/** TODO: studio inboxes. Empty addresses are left out of the page. */
export const EMAILS = {
  hello: "",
  press: "",
};

export const SOCIALS = [
  { label: "Instagram", href: "" },
  { label: "YouTube", href: "" },
  { label: "X", href: "" },
  {
    label: "WhatsApp",
    href: "https://chat.whatsapp.com/IzsF5yA0ZXMI31ULt0ZUCZ?mode=gi_t",
  },
].filter((s) => s.href);
