// B"H
/**
 * @file feedCardObserver.js
 * @description
 * Chapter 333 rewritten: the feed reveals the centered card without forcing a
 * layout calculation for every raw scroll event. The Awtsmoos lets the native
 * river flow; this module merely listens passively and updates once per frame.
 */

import { bindRafViewportUpdates } from '../../../../../shared/visual/createRafScrollBinder.js';
import { markCenteredElement } from '../../../../../shared/visual/findCenteredElement.js';

let cleanup = null;

/**
 * Mark the Home post card nearest the viewport center.
 * @param {ParentNode} root
 * @returns {Function} cleanup function
 */
export function bindFeedCardObserver(root = document) {
  if (cleanup) cleanup();

  const cards = [...root.querySelectorAll('.home-post-card')];
  if (!cards.length) {
    cleanup = () => {};
    return cleanup;
  }

  const update = () => markCenteredElement(cards, 'is-feed-current');
  cleanup = bindRafViewportUpdates({ update });
  return cleanup;
}
