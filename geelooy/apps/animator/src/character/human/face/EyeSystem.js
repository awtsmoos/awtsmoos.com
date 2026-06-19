
// B"H

/**
 * @file EyeSystem.js
 * @description
 * ============================================================================
 * CHAPTER: THE EYES THAT BLINKED, DARTED, AND LOOKED WITH INTENTION
 * ============================================================================
 *
 * Eyes need blink timing, pupil drift, gaze, and eyelid openness. This system
 * gives readable life without depending on the old broken renderer.
 *
 * @module EyeSystem
 */

/**
 * @class EyeSystem
 * @description
 * Direct canvas eye renderer and sampler.
 */
export class EyeSystem {
  /**
   * Samples eye pose.
   *
   * @param {Object} character - Character.
   * @param {number} time - Time.
   * @param {number} index - Index.
   * @returns {Object} Eye pose.
   */
  static sample(character = {}, time = 0, index = 0) {
    const perf = character.currentPerformance || {};
    const gaze = perf.gaze || character.gaze || 'camera';
    const blinkPhase = ((time + index * 377) % 4300) / 4300;
    const open = blinkPhase > 0.955 ? 0.05 : blinkPhase > 0.925 ? 0.35 : 1;
    const gazeMap = {
      camera: { x: 0, y: 0 },
      toward_camera: { x: 0, y: 0 },
      left: { x: -0.45, y: 0 },
      right: { x: 0.45, y: 0 },
      up: { x: 0, y: -0.35 },
      down: { x: 0, y: 0.35 },
      forward: { x: 0.18, y: 0 }
    };
    const base = gazeMap[gaze] || gazeMap.camera;
    return {
      open,
      pupilX: base.x + Math.sin(time * 0.0017 + index) * 0.08,
      pupilY: base.y + Math.cos(time * 0.0013 + index) * 0.05
    };
  }

  /**
   * Draws one eye.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {number} x - X.
   * @param {number} y - Y.
   * @param {number} scale - Scale.
   * @param {Object} pose - Eye pose.
   * @returns {void}
   */
  static draw(ctx, x, y, scale, pose) {
    if (pose.open < 0.15) {
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(x - 6 * scale, y);
      ctx.lineTo(x + 6 * scale, y);
      ctx.stroke();
      return;
    }

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, y, 6.2 * scale, 6.2 * scale * pose.open, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(x + pose.pupilX * 3.5 * scale, y + pose.pupilY * 3.5 * scale, 2.6 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(x + 1.8 * scale, y - 1.8 * scale, 0.9 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}
