// B"H
/**
 * @file createRafScrollBinder.test.mjs
 * @description
 * The Awtsmoos lets visual listeners breathe once per frame. This test proves
 * the binder is passive, immediately initializes state, coalesces event storms,
 * and removes listeners during cleanup.
 */

import { bindRafViewportUpdates } from '../createRafScrollBinder.js';

const listeners = new Map();
const removals = [];
const passiveFlags = [];
let frameQueue = [];
let updates = 0;

globalThis.requestAnimationFrame = callback => {
  frameQueue.push(callback);
  return frameQueue.length;
};

const target = {
  addEventListener(name, handler, options) {
    listeners.set(name, handler);
    passiveFlags.push(options?.passive === true);
  },
  removeEventListener(name, handler) {
    removals.push({ name, handler });
  }
};

const cleanup = bindRafViewportUpdates({
  target,
  events: ['scroll', 'resize'],
  update() { updates += 1; }
});

if (updates !== 1) throw new Error('binder did not run immediate update synchronously');
if (!passiveFlags.every(Boolean) || passiveFlags.length !== 2) {
  throw new Error('binder did not attach passive listeners for all events');
}

listeners.get('scroll')();
listeners.get('scroll')();
listeners.get('resize')();
if (frameQueue.length !== 1) throw new Error('binder did not coalesce event storm into one frame');

frameQueue.shift()();
if (updates !== 2) throw new Error('binder did not run scheduled update exactly once');

cleanup();
if (removals.length !== 2) throw new Error('binder did not remove all listeners');

listeners.get('scroll')();
if (frameQueue.length !== 0) throw new Error('disposed binder still queued work');

console.log('B"H createRafScrollBinder.test passed');
