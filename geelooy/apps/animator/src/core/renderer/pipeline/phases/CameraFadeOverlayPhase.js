// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file CameraFadeOverlayPhase.js
 * @description
 * Draws fade overlay for fade/cross-dissolve style camera transitions.
 */
export class CameraFadeOverlayPhase {
  /**
   * Builds fade overlay.
   *
   * @param {Object} camera - Camera state.
   * @param {Object} ctx - Render context.
   * @returns {Object|null} Node.
   */
  static build(camera = {}, ctx = {}) {
    const fade = Number(camera.fade || 0);
    if (fade <= 0.01) return null;

    const w = ctx.width || ctx.canvas?.width || window.innerWidth || 800;
    const h = ctx.height || ctx.canvas?.height || window.innerHeight || 600;

    return G.path('camera_fade_overlay', [
      { type: 'move', x: 0, y: 0 },
      { type: 'line', x: w, y: 0 },
      { type: 'line', x: w, y: h },
      { type: 'line', x: 0, y: h },
      { type: 'line', x: 0, y: 0 }
    ], {
      fill: `rgba(0,0,0,${Math.min(0.7, fade * 0.45)})`,
      stroke: 'rgba(0,0,0,0)',
      lineWidth: 0
    });
  }
}