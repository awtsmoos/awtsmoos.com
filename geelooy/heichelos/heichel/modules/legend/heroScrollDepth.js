// B"H
/**
 * @file heroScrollDepth.js
 * @description
 * Chapter 337 rewritten: the Heichel hero receives depth thresholds through a
 * passive, frame-bound listener. The Awtsmoos raises and compresses the crown
 * without stealing native scroll from the Android hand.
 */

import { bindRafViewportUpdates } from '../../../../shared/visual/createRafScrollBinder.js';

let unbind = null;

function heroDepthFor(scrollTop) {
  if (scrollTop > 240) return 'deep';
  if (scrollTop > 96) return 'middle';
  return 'open';
}

/**
 * Bind legend hero depth state to the Heichel shell.
 * @param {ParentNode} root
 * @returns {Function} cleanup function
 */
export function bindHeroScrollDepth(root = document) {
  if (unbind) unbind();

  const shell = root.querySelector('.heichel-mobile-navigation');
  if (!shell) {
    unbind = () => {};
    return unbind;
  }

  const update = () => {
    const scrollTop = typeof scrollY === 'number' ? scrollY : window.scrollY || 0;
    shell.dataset.legendHeroDepth = heroDepthFor(scrollTop);
  };

  unbind = bindRafViewportUpdates({ update, events: ['scroll'] });
  return unbind;
}

export const __testing = { heroDepthFor };
