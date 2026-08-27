
// B"H

/**
 * @file CanvasMetricStore.js
 * @description
 * ============================================================================
 * CHAPTER: THE MEASUREMENT THAT DID NOT BREAK THE GETTER
 * ============================================================================
 *
 * A RenderContext may expose width and height as holy guarded gates: getters
 * only, no setters. The previous guardian smashed against those gates and the
 * browser cried out. This store bows instead. It writes metrics only into safe
 * private fields and optional state, never into read-only properties.
 *
 * @module CanvasMetricStore
 */

/**
 * @class CanvasMetricStore
 * @description
 * Stores canvas metrics without mutating read-only RenderContext getters.
 */
export class CanvasMetricStore {
  /**
   * Writes canvas metrics into safe places.
   *
   * @param {Object} ctxBag - Render context or plain context bag.
   * @param {Object} metrics - Canvas metrics to store.
   * @returns {Object} The same metrics object for chaining.
   */
  static write(ctxBag, metrics) {
    if (!ctxBag || !metrics) return metrics;

    try {
      Object.defineProperty(ctxBag, '__awCanvasMetrics', {
        value: metrics,
        configurable: true,
        enumerable: false,
        writable: true
      });
    } catch (error) {
      try {
        ctxBag.__awCanvasMetrics = metrics;
      } catch (innerError) {
        console.warn('B"H - CanvasMetricStore could not write private metrics.', innerError);
      }
    }

    const state = ctxBag.state || ctxBag.appState || null;
    if (state && typeof state.set === 'function') {
      state.set('canvas_metrics', metrics);
    }

    return metrics;
  }

  /**
   * Reads metrics from context, canvas, or viewport fallback.
   *
   * @param {Object} ctxBag - Render context or plain context bag.
   * @returns {Object} Complete metrics object.
   */
  static read(ctxBag) {
    const canvas = ctxBag && ctxBag.canvas ? ctxBag.canvas : null;
    const stored = ctxBag && ctxBag.__awCanvasMetrics ? ctxBag.__awCanvasMetrics : null;

    if (stored) return stored;

    const rect = canvas && canvas.getBoundingClientRect
      ? canvas.getBoundingClientRect()
      : { width: window.innerWidth || 800, height: window.innerHeight || 600, left: 0, top: 0 };

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const cssWidth = Math.max(1, rect.width || window.innerWidth || 800);
    const cssHeight = Math.max(1, rect.height || window.innerHeight || 600);

    return {
      valid: Boolean(canvas),
      dpr,
      cssWidth,
      cssHeight,
      pixelWidth: canvas && canvas.width ? canvas.width : Math.round(cssWidth * dpr),
      pixelHeight: canvas && canvas.height ? canvas.height : Math.round(cssHeight * dpr),
      left: rect.left || 0,
      top: rect.top || 0,
      changed: false
    };
  }

  /**
   * Resolves render width in pixels without assuming writable fields.
   *
   * @param {Object} ctxBag - Render context.
   * @returns {number} Pixel width.
   */
  static width(ctxBag) {
    const metrics = this.read(ctxBag);
    return metrics.pixelWidth || 800;
  }

  /**
   * Resolves render height in pixels without assuming writable fields.
   *
   * @param {Object} ctxBag - Render context.
   * @returns {number} Pixel height.
   */
  static height(ctxBag) {
    const metrics = this.read(ctxBag);
    return metrics.pixelHeight || 600;
  }
}
