// B"H
import { LightningRenderer } from '../core/lightningRenderer.js';
import { toRenderSnapshot } from './offscreen/worldSnapshot.js';

/**
 * AdaptiveRenderer chooses the quiet worker chamber when the browser allows it.
 *
 * Chapter 8: The Awtsmoos did not let frames pile into a flood. One snapshot
 * crosses the bridge at a time; if the body moves again before the painter
 * answers, only the newest breath is kept. Unsupported browsers remain on the
 * faithful main-thread renderer with no gameplay fork.
 */
export class AdaptiveRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    this.camera = { x: 0, y: 0 };
    this.metrics = { drawn: 0, total: 0 };
    this.mode = 'fallback';
    this.worker = null;
    this.fallback = null;
    this.reason = '';
    this.inFlight = false;
    this.pendingSnapshot = null;
    this.viewport = { width: canvas.clientWidth || canvas.width || 960, height: canvas.clientHeight || canvas.height || 540, dpr: pixelRatio() };
    this.boot();
  }

  /** Starts worker rendering when possible, otherwise starts the normal renderer. */
  boot() {
    if (!supportsOffscreen(this.canvas)) { this.useFallback('OffscreenCanvas unavailable'); return; }
    try {
      const offscreen = this.canvas.transferControlToOffscreen();
      this.worker = new Worker(new URL('./offscreen/offscreenRenderer.worker.js', import.meta.url), { type: 'module' });
      this.worker.onmessage = event => this.receive(event.data || {});
      this.worker.onerror = event => this.receive({ type: 'error', message: event.message || 'worker error' });
      this.mode = 'worker';
      this.post('init', { canvas: offscreen, viewport: this.readViewport() }, [offscreen]);
    } catch (error) {
      this.useFallback(error?.message || 'OffscreenCanvas boot failed');
    }
  }

  /** @param {object} world active render world */
  draw(world) {
    if (this.mode !== 'worker') { this.fallback.draw(world); this.camera = this.fallback.camera; this.metrics = this.fallback.metrics; return; }
    const snapshot = toRenderSnapshot(world, this.readViewport());
    if (this.inFlight) { this.pendingSnapshot = snapshot; return; }
    this.sendSnapshot(snapshot);
  }

  /** @param {object} snapshot structured render world */
  sendSnapshot(snapshot) { this.inFlight = true; this.post('draw', { snapshot }); }

  /** @param {string} reason fallback reason */
  useFallback(reason) {
    this.mode = 'fallback';
    this.reason = reason;
    this.fallback = new LightningRenderer(this.canvas, this.options);
    this.camera = this.fallback.camera;
    this.metrics = this.fallback.metrics;
  }

  /** @param {object} data worker message */
  receive(data) {
    if (data.type === 'camera') {
      this.inFlight = false;
      this.camera = data.camera || this.camera;
      this.metrics = data.metrics || this.metrics;
      if (this.pendingSnapshot) { const latest = this.pendingSnapshot; this.pendingSnapshot = null; this.sendSnapshot(latest); }
    }
    if (data.type === 'error') { this.inFlight = false; console.warn('[Sulam HaSod renderer worker]', data.message); }
  }

  /** @returns {{width:number,height:number,dpr:number}} current CSS viewport */
  readViewport() {
    const rect = this.canvas.getBoundingClientRect?.() || {};
    this.viewport = {
      width: Math.max(320, Math.round(rect.width || this.canvas.clientWidth || this.viewport.width || 960)),
      height: Math.max(320, Math.round(rect.height || this.canvas.clientHeight || this.viewport.height || 540)),
      dpr: pixelRatio()
    };
    return this.viewport;
  }

  /** @param {string} type worker packet type @param {object} body packet body @param {Array<object>} transfer transfer list */
  post(type, body = {}, transfer = []) { this.worker?.postMessage({ type, ...body }, transfer); }
}

/** @param {HTMLCanvasElement} canvas visible canvas @returns {boolean} support flag */
function supportsOffscreen(canvas) {
  return Boolean(globalThis.Worker && globalThis.OffscreenCanvas && canvas?.transferControlToOffscreen);
}

/** @returns {number} capped device pixel ratio */
function pixelRatio() { return Math.max(1, Math.min(1.75, Number(globalThis.devicePixelRatio || 1))); }
