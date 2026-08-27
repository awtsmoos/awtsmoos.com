// B"H

/**
 * @file CanvasViewportSeal.js
 * @description
 * ============================================================================
 * CHAPTER: THE CANVAS THAT LEARNED HUMILITY
 * ============================================================================
 *
 * The canvas must know its size. But if the engine already knows the size, this
 * class must not smash the buffer every breath and call it wisdom. That caused
 * blurry mobile frames, competing DPR calculations, and subtle distortion.
 *
 * This seal is cooperative. It writes CSS truth into data attributes, emits an
 * event for the engine, and only mutates the physical pixel buffer when the
 * canvas is empty, invalid, or catastrophically mismatched.
 *
 * The Awtsmoos is beyond pixels. Pixels are still created from nothing every
 * instant. Therefore every pixel receives measure, but no helper worships its
 * own measuring rod.
 *
 * @class CanvasViewportSeal
 */
export class CanvasViewportSeal {
  /**
   * Installs the seal on a canvas.
   *
   * @param {string} canvasId - DOM id of the canvas.
   * @param {Object} options - Seal configuration.
   * @param {boolean} options.cooperative - Whether to avoid fighting the render context.
   * @param {number} options.maxDevicePixelRatio - DPR ceiling used for emergency repair.
   * @param {boolean} options.emergencyOnly - Whether to resize only when clearly broken.
   * @returns {Function} Cleanup function.
   */
  static install(canvasId, options = {}) {
    const config = {
      cooperative: options.cooperative !== false,
      maxDevicePixelRatio: Number.isFinite(options.maxDevicePixelRatio) ? options.maxDevicePixelRatio : 2,
      emergencyOnly: options.emergencyOnly !== false
    };

    const state = { observer: null, raf: 0, alive: true };

    const attempt = () => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        state.raf = requestAnimationFrame(attempt);
        return;
      }

      const apply = () => this.apply(canvas, config);
      apply();

      if ('ResizeObserver' in window) {
        state.observer = new ResizeObserver(() => {
          if (!state.alive) return;
          cancelAnimationFrame(state.raf);
          state.raf = requestAnimationFrame(apply);
        });
        state.observer.observe(canvas);
      }

      window.addEventListener('resize', apply, { passive: true });
      window.addEventListener('orientationchange', apply, { passive: true });
      canvas.dataset.awtsmoosRectified = 'cooperative';

      state.cleanup = () => {
        state.alive = false;
        cancelAnimationFrame(state.raf);
        if (state.observer) state.observer.disconnect();
        window.removeEventListener('resize', apply);
        window.removeEventListener('orientationchange', apply);
      };
    };

    attempt();
    return () => state.cleanup && state.cleanup();
  }

  /**
   * Applies one sizing pass.
   *
   * @param {HTMLCanvasElement} canvas - Canvas element.
   * @param {Object} config - Seal configuration.
   * @returns {void}
   */
  static apply(canvas, config) {
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height));
    const dpr = Math.max(1, Math.min(config.maxDevicePixelRatio, window.devicePixelRatio || 1));
    const targetW = Math.max(1, Math.round(cssW * dpr));
    const targetH = Math.max(1, Math.round(cssH * dpr));

    canvas.dataset.awtsmoosCssWidth = String(cssW);
    canvas.dataset.awtsmoosCssHeight = String(cssH);
    canvas.dataset.awtsmoosDprHint = String(dpr);

    const currentW = canvas.width || 0;
    const currentH = canvas.height || 0;
    const empty = currentW < 2 || currentH < 2;
    const mismatch = Math.abs(currentW - targetW) > targetW * 0.5 || Math.abs(currentH - targetH) > targetH * 0.5;

    if (!config.emergencyOnly || empty || mismatch) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    canvas.dispatchEvent(new CustomEvent('awtsmoos:viewport-sealed', {
      bubbles: false,
      detail: { cssW, cssH, dpr, width: canvas.width, height: canvas.height }
    }));
  }
}