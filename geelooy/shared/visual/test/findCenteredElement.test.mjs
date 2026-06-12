// B"H
/**
 * @file findCenteredElement.test.mjs
 * @description
 * The Awtsmoos reveals center from actual geometry. This test proves the shared
 * helper crowns the closest vessel and removes the crown from all others.
 */

import { findCenteredElement, markCenteredElement } from '../findCenteredElement.js';

function element(top, height) {
  const toggles = [];
  return {
    toggles,
    getBoundingClientRect() { return { top, height }; },
    classList: {
      toggle(name, on) { toggles.push({ name, on }); }
    }
  };
}

const far = element(20, 40);
const near = element(460, 80);
const low = element(900, 100);

const centered = findCenteredElement([far, near, low], 1000);
if (centered !== near) throw new Error('findCenteredElement did not select closest center');

const marked = markCenteredElement([far, near, low], 'is-current', 1000);
if (marked !== near) throw new Error('markCenteredElement returned wrong element');
if (!near.toggles.some(entry => entry.name === 'is-current' && entry.on === true)) {
  throw new Error('center element was not toggled on');
}
if (!far.toggles.some(entry => entry.name === 'is-current' && entry.on === false)) {
  throw new Error('far element was not toggled off');
}
if (findCenteredElement([{}], 1000) !== null) {
  throw new Error('invalid element should not be centered');
}

console.log('B"H findCenteredElement.test passed');
