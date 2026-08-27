
// B"H
import { CanvasPixelBuffer } from './CanvasPixelBuffer.js';
import { CanvasMetricStore } from './CanvasMetricStore.js';

/**
 * @file CanvasSizeGuardian.js
 * @description
 * ============================================================================
 * CHAPTER: THE GUARDIAN THAT LEARNED HUMILITY
 * ============================================================================
 *
 * The first guardian tried to write directly onto RenderContext.width and
 * RenderContext.height. Those were guarded getters, and the browser answered
 * with fire. Now the guardian bows: it resizes only the canvas bitmap, then
 * stores measurements in a safe hidden chamber.
 *
 * If mobile chrome shifts, if visualViewport breathes, if orientation turns
 * the world sideways, this guardian measures again without crashing, without
 * console storms, without pretending blackness is peace.
 *
 * @module CanvasSizeGuardian
 */

/**
 * @class CanvasSizeGuardian
 * @description
 * Keeps the canvas pixel buffer synchronized with its visible CSS rectangle.
 */
export class CanvasSizeGuardian {
  static _failed = false;

  /**
   * Binds resize rectification to a canvas.
   *
   * @param {HTMLCanvasElement} canvas - Canvas to guard.
   * @param {Object} ctxBag - Render context bag.
   * @returns {Function} Cleanup function that removes all listeners.
   */
  static bind(canvas, ctxBag = {}) {
    if (!canvas) return () => {};

    this._failed = false;
    let earlyFrames = 0;
    let interval = null;

    const cleanupBag = {
      active: true,
      cleanup: () => {}
    };

    const safeRectify = () => {
      if (!cleanupBag.active || this._failed) return;
      try {
        this.rectify(canvas, ctxBag);
      } catch (error) {
        this._failed = true;
        console.error('B"H - CanvasSizeGuardian failed and disabled itself to prevent a console storm.', error);
        cleanupBag.cleanup();
      }
    };

    interval = window.setInterval(() => {
      earlyFrames += 1;
      safeRectify();
      if (earlyFrames >= 30 && interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    }, 100);

    window.addEventListener('resize', safeRectify, { passive: true });
    window.addEventListener('orientationchange', safeRectify, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', safeRectify, { passive: true });
      window.visualViewport.addEventListener('scroll', safeRectify, { passive: true });
    }

    cleanupBag.cleanup = () => {
      cleanupBag.active = false;
      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
      window.removeEventListener('resize', safeRectify);
      window.removeEventListener('orientationchange', safeRectify);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', safeRectify);
        window.visualViewport.removeEventListener('scroll', safeRectify);
      }
    };

    safeRectify();
    return cleanupBag.cleanup;
  }

  /**
   * Measures and rectifies the canvas.
   *
   * @param {HTMLCanvasElement} canvas - Canvas to rectify.
   * @param {Object} ctxBag - Render context bag.
   * @returns {Object} Metrics object.
   */
  static rectify(canvas, ctxBag = {}) {
    const metrics = CanvasPixelBuffer.measure(canvas);
    CanvasPixelBuffer.apply(canvas, metrics);
    CanvasMetricStore.write(ctxBag, metrics);
    return metrics;
  }
}
