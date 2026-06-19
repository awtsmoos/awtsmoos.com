
// B"H
import { SafeFrameResolver } from '../camera/SafeFrameResolver.js';

/**
 * @file CameraProbe.js
 * @description
 * ============================================================================
 * CHAPTER: THE SAFE FRAME DRAWN LIKE A COVENANT
 * ============================================================================
 *
 * When humans vanish, the camera must testify. This probe draws the top, bottom,
 * actor frame, center line, and ground line so no actor can hide in math.
 *
 * @module CameraProbe
 */

/**
 * @class CameraProbe
 * @description
 * Draws camera safety geometry.
 */
export class CameraProbe {
  /**
   * Paints camera frame diagnostics.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {Object} ctxBag - App render context.
   * @returns {void}
   */
  static paint(ctx, ctxBag) {
    if (!ctx || !ctxBag) return;
    const safe = SafeFrameResolver.resolve(ctxBag);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.line(ctx, 0, safe.top, safe.width, safe.top, '#ffffff', 'top');
    this.line(ctx, 0, safe.bottom, safe.width, safe.bottom, '#ffd23f', 'bottom');
    this.line(ctx, 0, safe.actorTop, safe.width, safe.actorTop, '#00f0ff', 'actorTop');
    this.line(ctx, 0, safe.actorBottom, safe.width, safe.actorBottom, '#ff4fd8', 'actorBottom');
    this.line(ctx, safe.centerX, 0, safe.centerX, safe.height, '#80ff80', 'centerX');
    ctx.restore();
  }

  /**
   * Draws one labeled line.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {number} x1 - Start x.
   * @param {number} y1 - Start y.
   * @param {number} x2 - End x.
   * @param {number} y2 - End y.
   * @param {string} color - Stroke color.
   * @param {string} label - Label text.
   * @returns {void}
   */
  static line(ctx, x1, y1, x2, y2, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '12px monospace';
    ctx.fillText(label + ' ' + Math.round(y1), 12, Math.max(14, y1 - 4));
  }
}
