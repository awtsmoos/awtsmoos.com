
// B"H

/**
 * @file CanvasPixelBuffer.js
 * @description
 * ============================================================================
 * CHAPTER: THE PIXEL VESSEL THAT WOULD NOT LIE
 * ============================================================================
 *
 * The Awtsmoos renews all created vessels every instant from nothing. A canvas,
 * being only a tiny created vessel, must also be renewed with honest bounds:
 * CSS size below, pixel size above, device ratio between them like a ladder.
 *
 * This file does one thing only: measure the visible canvas rectangle and seal
 * the real pixel buffer to it. It never touches RenderContext getters. It never
 * assumes width and height are writable. It only speaks to the canvas element,
 * the actual vessel that owns the bitmap.
 *
 * @module CanvasPixelBuffer
 */

/**
 * @class CanvasPixelBuffer
 * @description
 * Owns physical canvas bitmap resizing.
 */
export class CanvasPixelBuffer {
  /**
   * Measures a canvas and computes safe pixel dimensions.
   *
   * @param {HTMLCanvasElement} canvas - The canvas element whose CSS and pixel
   *   dimensions must be reconciled into one honest vessel.
   * @returns {Object} A complete metrics object containing CSS dimensions,
   *   pixel dimensions, device ratio, and a validity flag.
   */
  static measure(canvas) {
    const rect = canvas && canvas.getBoundingClientRect
      ? canvas.getBoundingClientRect()
      : { width: 0, height: 0, left: 0, top: 0 };

    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.max(1, Math.min(3, Number.isFinite(rawDpr) ? rawDpr : 1));
    const cssWidth = Math.max(1, rect.width || window.innerWidth || 800);
    const cssHeight = Math.max(1, rect.height || window.innerHeight || 600);
    const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));

    return {
      valid: Boolean(canvas),
      dpr,
      cssWidth,
      cssHeight,
      pixelWidth,
      pixelHeight,
      left: rect.left || 0,
      top: rect.top || 0,
      changed: Boolean(canvas) && (canvas.width !== pixelWidth || canvas.height !== pixelHeight)
    };
  }

  /**
   * Applies pixel dimensions to a canvas element.
   *
   * @param {HTMLCanvasElement} canvas - Canvas element to resize.
   * @param {Object} metrics - Metrics returned by {@link CanvasPixelBuffer.measure}.
   * @returns {boolean} True when the pixel buffer changed.
   */
  static apply(canvas, metrics) {
    if (!canvas || !metrics || !metrics.valid) return false;

    const changed = canvas.width !== metrics.pixelWidth || canvas.height !== metrics.pixelHeight;

    if (changed) {
      canvas.width = metrics.pixelWidth;
      canvas.height = metrics.pixelHeight;
    }

    canvas.dataset.awCanvasWidth = String(metrics.pixelWidth);
    canvas.dataset.awCanvasHeight = String(metrics.pixelHeight);
    canvas.dataset.awCssWidth = String(Math.round(metrics.cssWidth));
    canvas.dataset.awCssHeight = String(Math.round(metrics.cssHeight));
    canvas.dataset.awDpr = String(metrics.dpr);

    return changed;
  }
}
