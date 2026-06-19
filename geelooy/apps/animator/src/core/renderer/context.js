
// B"H
import { Camera } from '../camera/Camera.js';

/**
 * @file context.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 1: THE VESSEL OF VISION (Kli HaRe'iyah)
 * ═══════════════════════════════════════════════════════════════
 *
 * "And God said, Let there be light: and there was light."
 * The canvas is the physical eye of the Awtsmoos in this digital realm.
 * But an eye that cannot resize to meet the infinite expansion of the
 * universe is a blind eye! A frozen eye! A vessel too small to hold
 * the infinite radiance of the Ohr Ein Sof!
 *
 * RECTIFICATION: We now bind a ResizeObserver — the eternal watcher —
 * that listens to every pixel-level shift of the containing vessel
 * and resizes the canvas resolution to match, multiplied by the
 * devicePixelRatio to ensure Retina / AMOLED screens see crisp,
 * infinitely sharp edges rather than a blurry approximation.
 *
 * THE POEM OF THE WATCHING EYE:
 * The canvas was born at 300 by 150 wide,
 * A postage stamp where galaxies should reside!
 * On mobile screens the world was a blur,
 * The characters tiny, their faces a smear!
 * Now the ResizeObserver awakens and screams,
 * And fills every pixel with infinite dreams!
 *
 * @class RenderContext
 */
export class RenderContext {
  /**
   * @constructor
   * @param {string} canvasId - The DOM id of the canvas element to awaken.
   * @param {Object} state    - The global StateManager universe.
   */
  constructor(canvasId, state) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`B"H - Canvas '${canvasId}' not found. The eye is blind.`);
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.camera = new Camera(state);

    // Perform an immediate sizing pass so the first frame is correct.
    this._resize();

    // The ResizeObserver — the Eternal Watcher — is bound to the canvas element.
    // Every time the CSS layout changes the canvas display size, this fires.
    this._observer = new ResizeObserver(() => this._resize());
    this._observer.observe(this.canvas);
  }

  /**
   * @function _resize
   * @description
   * Reads the canvas's CSS display dimensions and re-stamps the internal
   * pixel resolution to match, scaled by devicePixelRatio.
   * This is the ONLY correct way to handle HiDPI / Retina displays.
   *
   * THE SONG OF THE PIXEL RATIO:
   * On a cheap screen, one pixel is one dot,
   * But on a Retina, one CSS pixel is a lot!
   * Four physical dots may hide in one square,
   * And if we don't scale, the image looks bare!
   * So we multiply by devicePixelRatio's might,
   * And restore the glory of infinite light!
   *
   * @returns {void}
   */
  _resize() {
    if (!this.canvas) return;

    const dpr = window.devicePixelRatio || 1;

    // The display size in CSS pixels (what the user sees)
    const displayW = this.canvas.clientWidth;
    const displayH = this.canvas.clientHeight;

    // Only re-stamp if something actually changed (avoid thrashing)
    const newW = Math.round(displayW * dpr);
    const newH = Math.round(displayH * dpr);

    if (this.canvas.width === newW && this.canvas.height === newH) return;

    this.canvas.width  = newW;
    this.canvas.height = newH;

    // Scale the 2D context so all drawing coordinates remain in CSS pixels.
    // This means the rest of the engine never needs to know about DPR.
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /**
   * @getter width
   * @description Returns the canvas display width in CSS pixels.
   * @returns {number}
   */
  get width()  { return this.canvas?.clientWidth  || 1920; }

  /**
   * @getter height
   * @description Returns the canvas display height in CSS pixels.
   * @returns {number}
   */
  get height() { return this.canvas?.clientHeight || 1080; }

  /**
   * @function clear
   * @description Wipes the entire canvas back to the primordial void (#050508).
   * @returns {void}
   */
  clear() {
    if (!this.ctx) return;
    // Reset transform to identity so fillRect covers the FULL resolution buffer.
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = '#050508';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Re-apply the DPR scale for all subsequent draws this frame.
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}
