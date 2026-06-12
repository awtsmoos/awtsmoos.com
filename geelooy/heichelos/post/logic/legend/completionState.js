// B"H
/**
 * @file completionState.js
 * @description
 * Chapter 342 rewritten: the chamber senses near-completion without binding a
 * raw scroll calculation. The Awtsmoos opens the completion gate gently, once
 * per frame, while the reader keeps native momentum.
 */

import { bindRafViewportUpdates } from '../../../../shared/visual/createRafScrollBinder.js';
import { __testing as progressTesting } from './readingProgressState.js';

let unbind = null;

function isNearComplete(ratio, threshold = 0.92) {
  return ratio > threshold;
}

function currentScrollTop() {
  if (typeof scrollY === 'number') return scrollY;
  return document.documentElement.scrollTop || document.body?.scrollTop || 0;
}

/**
 * Bind near-completion class to reader root.
 * @returns {Function} cleanup function
 */
export function bindCompletionState() {
  if (unbind) unbind();

  const root = document.querySelector('.post-reader-localized-context');
  if (!root) {
    unbind = () => {};
    return unbind;
  }

  const update = () => {
    const ratio = progressTesting.progressRatio({
      scrollTop: currentScrollTop(),
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: innerHeight
    });
    root.classList.toggle('reader-near-complete', isNearComplete(ratio));
  };

  unbind = bindRafViewportUpdates({ update, events: ['scroll', 'resize'] });
  return unbind;
}

export const __testing = { isNearComplete };
