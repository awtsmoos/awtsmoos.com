// B"H
/**
 * @file cardDepthObserver.js
 * @description
 * Chapter 336 rewritten: Heichel cards receive depth from a single passive,
 * frame-bound listener. The Awtsmoos crowns the centered artifact, but Android
 * Chrome must not be dragged through synchronous geometry on every scroll tick.
 */

import { bindRafViewportUpdates } from '../../../../shared/visual/createRafScrollBinder.js';
import { markCenteredElement } from '../../../../shared/visual/findCenteredElement.js';

let unbind = null;

/**
 * Mark the `.nav-card` nearest the viewport center.
 * @param {ParentNode} root
 * @returns {Function} cleanup function
 */
export function bindCardDepthObserver(root = document) {
  if (unbind) unbind();

  const cards = [...root.querySelectorAll('.nav-card')];
  if (!cards.length) {
    unbind = () => {};
    return unbind;
  }

  const update = () => markCenteredElement(cards, 'is-card-current');
  unbind = bindRafViewportUpdates({ update });
  return unbind;
}
