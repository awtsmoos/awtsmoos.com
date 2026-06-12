// B"H
/**
 * @file centerSectionObserver.js
 * @description
 * Chapter 340 rewritten: the manuscript crown moves to the centered section
 * through one passive rAF-bound listener. The Awtsmoos lets the reader's native
 * scroll remain king; this vessel only marks what the eye is already studying.
 */

import { bindRafViewportUpdates } from '../../../../shared/visual/createRafScrollBinder.js';
import { markCenteredElement } from '../../../../shared/visual/findCenteredElement.js';

let unbind = null;

/**
 * Mark the reader chunk nearest viewport center.
 * @returns {Function} cleanup function
 */
export function bindCenterSectionObserver() {
  if (unbind) unbind();

  const chunks = [...document.querySelectorAll('#realPost .scroll-chunk')];
  if (!chunks.length) {
    unbind = () => {};
    return unbind;
  }

  const update = () => markCenteredElement(chunks, 'is-reader-center');
  unbind = bindRafViewportUpdates({ update });
  return unbind;
}
