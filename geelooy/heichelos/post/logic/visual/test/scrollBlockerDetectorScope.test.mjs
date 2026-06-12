// B"H
/**
 * @file scrollBlockerDetectorScope.test.mjs
 * @description
 * The detector must not wander through every body descendant. It should ask for
 * the focused overlay selector only, then measure plausible blockers. Warnings
 * are captured because the test intentionally creates a blocker.
 */

import { detectScrollBlockers, resetScrollBlockerCache, __testing } from '../scrollBlockerDetector.js';

let queriedSelector = '';
let measured = 0;
let styled = 0;
let warnings = 0;

const blocker = {
  tagName: 'DIV',
  id: 'gate',
  className: 'modal',
  getBoundingClientRect() {
    measured += 1;
    return { width: 900, height: 900 };
  }
};

const harmless = {
  tagName: 'DIV',
  id: 'rail',
  className: 'awtsmoos-progress-spine',
  getBoundingClientRect() {
    measured += 1;
    return { width: 10, height: 10 };
  }
};

globalThis.innerWidth = 1000;
globalThis.innerHeight = 1000;
globalThis.window = globalThis;
globalThis.console = { ...console, warn() { warnings += 1; } };
globalThis.getComputedStyle = node => {
  styled += 1;
  if (node === blocker) return { position: 'fixed', pointerEvents: 'auto', visibility: 'visible', display: 'block' };
  return { position: 'fixed', pointerEvents: 'none', visibility: 'visible', display: 'block' };
};

const root = {
  querySelectorAll(selector) {
    queriedSelector = selector;
    return [blocker, harmless];
  }
};

resetScrollBlockerCache();
const blockers = detectScrollBlockers(root, { force: true });

if (queriedSelector.includes('body *')) throw new Error('detector regressed to body-wide scan');
if (!queriedSelector.includes('[role="dialog"]') || !queriedSelector.includes('.modal')) {
  throw new Error('detector did not use focused overlay selector');
}
if (blockers.length !== 1 || blockers[0].id !== 'gate') {
  throw new Error('detector did not identify the single large fixed blocker');
}
if (measured !== 1) throw new Error(`detector measured ${measured} nodes instead of only plausible blockers`);
if (styled !== 2) throw new Error('detector should inspect style of candidates only');
if (warnings !== 1) throw new Error('detector should warn exactly once for detected blockers');
if (!__testing.BLOCKER_SELECTOR.includes('.reader-sidebar')) {
  throw new Error('detector selector lost reader sidebar coverage');
}

console.log('B"H scrollBlockerDetectorScope.test passed');
