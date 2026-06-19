
// B"H
import { CanvasMetricStore } from '../rectification/CanvasMetricStore.js';

/**
 * @file BootVisualSentinel.js
 * @description
 * ============================================================================
 * CHAPTER: THE FIRST FLAME BEFORE THE WORLD APPEARED
 * ============================================================================
 *
 * Before actors, camera, NLE, or timeline can be blamed, the engine must prove
 * the canvas itself can receive light. This sentinel paints direct pixels after
 * size rectification. If this appears, the vessel is alive. If it vanishes,
 * the pipeline or overlay has swallowed the stage.
 *
 * @module BootVisualSentinel
 */

/**
 * @class BootVisualSentinel
 * @description
 * Direct boot-time canvas painter.
 */
export class BootVisualSentinel {
  /**
   * Paints an unmistakable boot frame.
   *
   * @param {Object} ctxBag - App render context bag.
   * @returns {void}
   */
  static paint(ctxBag) {
    const canvas = ctxBag && ctxBag.canvas;
    const ctx = ctxBag && ctxBag.ctx;
    if (!canvas || !ctx) return;

    const metrics = CanvasMetricStore.read(ctxBag);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#260000';
    ctx.fillRect(0, 0, canvas.width || 1, canvas.height || 1);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 26px system-ui, sans-serif';
    ctx.fillText('B"H CANVAS IS ALIVE', 24, 48);
    ctx.font = '16px monospace';
    ctx.fillText('pixel: ' + canvas.width + ' x ' + canvas.height, 24, 82);
    ctx.fillText('css: ' + Math.round(metrics.cssWidth) + ' x ' + Math.round(metrics.cssHeight), 24, 106);
    ctx.fillText('dpr: ' + metrics.dpr, 24, 130);
    ctx.fillText('time: ' + new Date().toLocaleTimeString(), 24, 154);
    ctx.fillStyle = '#ffdf3d';
    ctx.fillRect(24, 178, 220, 18);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(24, 204, 160, 18);
    ctx.restore();
  }
}
