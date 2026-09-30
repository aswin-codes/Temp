"use client";

import dynamic from "next/dynamic";

/**
 * The site is a single animated page driven entirely by browser APIs (GSAP,
 * Lenis, matchMedia, video), and reads the pointer and motion preferences
 * once at load. It renders in the browser only, exactly as it did under Vite,
 * so there is nothing to mismatch between server and client.
 */
export const ClientSite = dynamic(() => import("../site/Site"), { ssr: false });
