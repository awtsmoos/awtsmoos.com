// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module chitasLoader
 * @description
 * Controls the beautiful Daily Chitas loading overlay: a Jewish-art-inspired
 * radial medallion shown while the reader hydrates. The overlay is purely
 * visual — server-rendered Torah text sits beneath it (SEO-safe, no-JS
 * readable). It fades smoothly once the reader signals ready.
 *
 * The overlay markup is server-rendered in the post template with
 * data-js="false"; this module flips it to data-js="true" on boot so the
 * CSS-only fallback fade never fires while JS is alive.
 */

const OVERLAY_ID = 'chitas-loader-overlay';
const BAR_SELECTOR = '.chitas-loader-bar';
const CIRCUMFERENCE = 415;

let overlay = null;
let bar = null;
let dismissed = false;
let progressTimer = null;

function findOverlay() {
  if (!overlay) {
    overlay = document.getElementById(OVERLAY_ID);
    bar = overlay ? overlay.querySelector(BAR_SELECTOR) : null;
  }
  return overlay;
}

export function chitasLoaderBoot() {
  const el = findOverlay();
  if (!el) return;
  el.setAttribute('data-js', 'true');
  // Gentle simulated progress while real hydration runs.
  let p = 0.08;
  setProgress(p);
  progressTimer = setInterval(() => {
    p = Math.min(p + 0.07, 0.92);
    setProgress(p);
  }, 600);
}

export function setProgress(fraction) {
  if (!findOverlay() || !bar) return;
  const f = Math.max(0, Math.min(1, Number(fraction) || 0));
  bar.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - f));
}

export function dismissChitasLoader() {
  if (dismissed) return;
  dismissed = true;
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  const el = findOverlay();
  if (!el) return;
  setProgress(1);
  // Let the ring complete visually, then fade.
  setTimeout(() => {
    el.setAttribute('data-hidden', 'true');
    setTimeout(() => el.remove(), 1000);
  }, 350);
}

// Auto-dismiss on reader ready signals.
if (typeof document !== 'undefined') {
  const tryDismiss = () => {
    if (document.body?.dataset?.readerFallbackReady === 'true') dismissChitasLoader();
    if (document.body?.dataset?.socialReaderReady === 'true') dismissChitasLoader();
  };
  new MutationObserver(tryDismiss).observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ['data-reader-fallback-ready', 'data-social-reader-ready'],
  });
  // Safety: never trap the reader behind the loader.
  setTimeout(dismissChitasLoader, 12000);
}
