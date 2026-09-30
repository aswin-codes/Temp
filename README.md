# Otaku Bharat

The landing site for Otaku Bharat, India's first short-form anime studio.
Next.js 16 (App Router), React 19, GSAP and Lenis. Deployed on Vercel at
https://www.otakubharat.com.

## Run locally

Requires Node.js 20.9 or newer.

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Resend values
   (only needed to send real "Notify me" emails).
3. `npm run dev`, then open http://localhost:5050

## Scripts

- `npm run dev` starts the dev server on port 5050
- `npm run build` makes a production build; `npm start` serves it
- `npm run lint` type-checks
- `npm run posters` regenerates video posters (needs ffmpeg and cwebp)

## Layout

- `src/app` holds the Next.js shell: layout, page, and `api/notify` (the Resend route)
- `src/site` holds the page itself; content lives in `src/site/config.ts`
- `public` holds the images, video and frame assets
