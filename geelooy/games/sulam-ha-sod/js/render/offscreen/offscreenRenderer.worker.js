// B"H
import { LightningRenderer } from '../../core/lightningRenderer.js';

let renderer = null;
let viewport = { width: 960, height: 540, dpr: 1 };

/**
 * Worker-side gate for OffscreenCanvas rendering.
 *
 * Chapter 4: The Awtsmoos placed the painter in a quiet chamber beyond the
 * main thread. The body still jumps on the main bridge; the worker only paints
 * the latest purified snapshot, then whispers the camera back like returning
 * breath from a hidden lung.
 */
self.onmessage = event => {
  const data = event.data || {};
  try {
    if (data.type === 'init') initRenderer(data.canvas, data.viewport);
    if (data.type === 'resize') viewport = saneViewport(data.viewport);
    if (data.type === 'draw') drawSnapshot(data.snapshot);
  } catch (error) {
    self.postMessage({ type: 'error', message: error?.message || String(error) });
  }
};

/** @param {OffscreenCanvas} canvas transferred canvas @param {object} nextViewport browser measure */
function initRenderer(canvas, nextViewport) {
  viewport = saneViewport(nextViewport);
  renderer = new LightningRenderer(canvas, { webcam: null });
  renderer.viewport = makeWorkerViewport(canvas);
  self.postMessage({ type: 'ready' });
}

/** @param {object} snapshot structured render world */
function drawSnapshot(snapshot) {
  if (!renderer || !snapshot) return;
  viewport = saneViewport(snapshot.viewport || viewport);
  const world = hydrateWorld(snapshot);
  renderer.draw(world);
  self.postMessage({ type: 'camera', camera: renderer.camera, metrics: renderer.metrics });
}

/** @param {OffscreenCanvas} canvas drawing target @returns {object} viewport shim */
function makeWorkerViewport(canvas) {
  return {
    sync(context) {
      const width = Math.max(320, Math.round(viewport.width || 960));
      const height = Math.max(320, Math.round(viewport.height || 540));
      const dpr = Math.max(1, Math.min(1.75, Number(viewport.dpr || 1)));
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      const changed = canvas.width !== pixelWidth || canvas.height !== pixelHeight;
      if (changed) { canvas.width = pixelWidth; canvas.height = pixelHeight; }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      return { width, height, dpr, changed };
    }
  };
}

/** @param {object} data plain snapshot @returns {object} renderer-compatible facade */
function hydrateWorld(data) {
  return {
    ...data,
    level: data.level || {},
    player: data.player || { x: 0, y: 0, w: 24, h: 42 },
    rotors: { bodies: () => data.rotorBodies || [] },
    tricks: {
      bodies: () => data.trickBodies || [],
      visualBodies: () => data.trickVisualBodies || data.trickBodies || [],
      hazardBodies: () => data.trickHazardBodies || []
    },
    spikes: {
      dormant: () => data.spikeDormant || [],
      warning: () => data.spikeWarning || [],
      active: () => data.spikeActive || []
    },
    momentumCurse: {
      warning: () => data.curseWarning || [],
      active: () => data.curseActive || []
    },
    trickCoins: { coins: data.trickCoinList || [] },
    canExit: () => Boolean(data.canExitNow),
    drainSoundEvents: () => []
  };
}

/** @param {object} value possible viewport @returns {{width:number,height:number,dpr:number}} safe viewport */
function saneViewport(value = {}) {
  return {
    width: Number(value.width || 960),
    height: Number(value.height || 540),
    dpr: Number(value.dpr || 1)
  };
}
