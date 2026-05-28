// B"H
import assert from 'node:assert/strict';
import { WebcamBubble } from '../js/systems/webcamBubble.js';

/**
 * Webcam bubble regression.
 *
 * The Awtsmoos permits the camera only by explicit request. This test keeps the
 * contract narrow: label state, video-only request shape, buffered frame reuse,
 * and track cleanup when the bubble is disabled.
 */
async function testUnavailableCameraFailsSafely() {
  const oldNavigator = globalThis.navigator;
  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
  const bubble = new WebcamBubble({ width: 32, height: 32, fps: 10 });
  const result = await bubble.enable();
  assert.equal(result.ok, false, 'missing webcam API should fail safely');
  assert.equal(bubble.enabled, false, 'failed enable should stay disabled');
  Object.defineProperty(globalThis, 'navigator', { value: oldNavigator, configurable: true });
}

async function testVideoOnlyEnableAndDisable() {
  const oldNavigator = globalThis.navigator;
  let constraints = null;
  let stopped = false;
  Object.defineProperty(globalThis, 'navigator', { value: { mediaDevices: { getUserMedia: async requested => {
    constraints = requested;
    return { getTracks: () => [{ stop: () => { stopped = true; } }] };
  } } }, configurable: true });
  const bubble = new WebcamBubble({ width: 32, height: 32, fps: 10 });
  const result = await bubble.enable();
  assert.equal(result.ok, true, 'mock webcam should enable');
  assert.deepEqual(constraints, { video: true, audio: false }, 'webcam request must be video-only');
  assert.equal(bubble.label(), 'Disable Webcam Bubble');
  bubble.disable();
  assert.equal(stopped, true, 'disable should stop media tracks');
  assert.equal(bubble.label(), 'Enable Webcam Bubble');
  Object.defineProperty(globalThis, 'navigator', { value: oldNavigator, configurable: true });
}

function testBufferedFrameReuse() {
  const bubble = new WebcamBubble({ width: 32, height: 32, fps: 10 });
  bubble.ready = true;
  bubble.enabled = true;
  bubble.video = { readyState: 2, videoWidth: 64, videoHeight: 32 };
  const first = bubble.frame(1000);
  const second = bubble.frame(1005);
  assert.ok(first, 'ready webcam should return buffer');
  assert.equal(first, second, 'throttled frame should reuse buffer');
}

await testUnavailableCameraFailsSafely();
await testVideoOnlyEnableAndDisable();
testBufferedFrameReuse();
console.log('Sulam HaSod webcam bubble regression ok');
