
// B"H
import { CanvasMetricStore } from '../rectification/CanvasMetricStore.js';

/**
 * @file FrameProbeOverlay.js
 * @description
 * ============================================================================
 * CHAPTER: THE HEARTBEAT WRITTEN OVER THE DARKNESS
 * ============================================================================
 *
 * When the screen is black and the console is quiet, the frame probe writes
 * truth in pixels: RAF count, canvas size, CSS size, character count, graph
 * count, and camera state. No mystery may hide forever.
 *
 * @module FrameProbeOverlay
 */

/**
 * @class FrameProbeOverlay
 * @description
 * Paints frame diagnostics directly onto the canvas.
 */
export class FrameProbeOverlay {
  static count = 0;

  /**
   * Paints runtime frame information.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
   * @param {Object} app - App object.
   * @param {Object} info - Additional render info.
   * @returns {void}
   */
  static paint(ctx, app, info = {}) {
    if (!ctx || !app || !app.ctx || !app.ctx.canvas) return;

    this.count += 1;

    const canvas = app.ctx.canvas;
    const metrics = CanvasMetricStore.read(app.ctx);
    const state = app.state;
    const chars = state && state.get ? state.get('characters') || {} : {};
    const cam = state && state.get ? state.get('camera') || {} : {};

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.94;
    ctx.fillStyle = 'rgba(0,0,0,0.74)';
    ctx.fillRect(8, 8, 350, 174);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 350, 174);
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px monospace';

    const lines = [
      'B"H FRAME ' + this.count,
      'pixel ' + canvas.width + 'x' + canvas.height,
      'css ' + Math.round(metrics.cssWidth) + 'x' + Math.round(metrics.cssHeight) + ' dpr ' + metrics.dpr,
      'chars ' + Object.keys(chars).length + ' rootChildren ' + (info.rootChildren || 0),
      'camera x:' + this.num(cam.x) + ' y:' + this.num(cam.y) + ' z:' + this.num(cam.zoom),
      'pipeline ' + (info.stage || 'after-render')
    ];

    for (let i = 0; i < lines.length; i += 1) {
      ctx.fillText(lines[i], 20, 34 + i * 24);
    }

    ctx.restore();
  }

  /**
   * Formats a number.
   *
   * @param {number} value - Numeric value.
   * @returns {string} Short number text.
   */
  static num(value) {
    return Number.isFinite(value) ? value.toFixed(2) : 'none';
  }
}
