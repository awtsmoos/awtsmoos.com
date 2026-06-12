// B"H
/**
 * @file readingProgressState.js
 * @description
 * Chapter 341 rewritten: the reader progress ratio updates through one passive,
 * frame-bound listener. The Awtsmoos carries the scroll river; this module only
 * writes the CSS variable that visual vessels may optionally drink from.
 */

import { bindRafViewportUpdates } from '../../../../shared/visual/createRafScrollBinder.js';

let unbind = null;

function progressRatio({ scrollTop, scrollHeight, viewportHeight }) {
  const max = Math.max(1, scrollHeight - viewportHeight);
  return Math.max(0, Math.min(1, scrollTop / max));
}

function currentScrollTop() {
  if (typeof scrollY === 'number') return scrollY;
  return document.documentElement.scrollTop || document.body?.scrollTop || 0;
}

/**
 * Bind `--reader-progress` to the localized reader root.
 * @returns {Function} cleanup function
 */
export function bindReadingProgressState() {
  if (unbind) unbind();

  const root = document.querySelector('.post-reader-localized-context') || document.documentElement;
  const update = () => {
    const ratio = progressRatio({
      scrollTop: currentScrollTop(),
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: innerHeight
    });
    root.style.setProperty('--reader-progress', String(ratio));
  };

  unbind = bindRafViewportUpdates({ update });
  return unbind;
}

export const __testing = { progressRatio };
