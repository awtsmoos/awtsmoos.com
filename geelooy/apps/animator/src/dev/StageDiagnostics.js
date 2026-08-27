// B"H
import { VirtualGraph as G } from '../engine/graph/VirtualGraph.js';
import { SafeFrameResolver } from '../camera/SafeFrameResolver.js';

/**
 * @file StageDiagnostics.js
 * @description
 * ============================================================================
 * CHAPTER: THE DIGGING KIT THAT SHOWS THE TRUTH WITHOUT RUINING THE SCENE
 * ============================================================================
 *
 * This is the debugging kit. It is intentionally quiet by default. It is used
 * only when localStorage.awtsmoosStageDebug equals "1".
 *
 * It does NOT draw borders around people. No ugly actor rectangles. No box
 * outlines around character groups. It only draws optional safe-frame guide
 * lines so the camera can be debugged without making people look boxed.
 *
 * RenderPipeline imports this file directly, so if debug mode is on, it is used.
 *
 * @class StageDiagnostics
 */
export class StageDiagnostics {
  /**
   * Returns whether diagnostics are enabled.
   *
   * @returns {boolean} Enabled flag.
   */
  static enabled() {
    try {
      return localStorage.getItem('awtsmoosStageDebug') === '1';
    } catch {
      return false;
    }
  }

  /**
   * Builds debug overlay.
   *
   * @param {Object} ctx - Render context.
   * @returns {Object|null} Debug node or null.
   */
  static build(ctx) {
    if (!this.enabled()) return null;

    const safe = SafeFrameResolver.resolve(ctx);
    return G.group('stage_diagnostics_safe_frame', null, [
      this.line('safe_top', 0, safe.actorTop, safe.width, safe.actorTop, 'rgba(0,255,190,0.45)'),
      this.line('safe_bottom', 0, safe.actorBottom, safe.width, safe.actorBottom, 'rgba(0,255,190,0.45)'),
      this.line('ground_hint', 0, safe.actorBottom - 42, safe.width, safe.actorBottom - 42, 'rgba(255,230,80,0.45)')
    ]);
  }

  /**
   * Builds line.
   *
   * @param {string} id - Id.
   * @param {number} x1 - X1.
   * @param {number} y1 - Y1.
   * @param {number} x2 - X2.
   * @param {number} y2 - Y2.
   * @param {string} color - Color.
   * @returns {Object} Line path.
   */
  static line(id, x1, y1, x2, y2, color) {
    return G.path(id, [
      { type: 'move', x: x1, y: y1 },
      { type: 'line', x: x2, y: y2 }
    ], {
      stroke: color,
      lineWidth: 2,
      lineCap: 'round'
    });
  }
}