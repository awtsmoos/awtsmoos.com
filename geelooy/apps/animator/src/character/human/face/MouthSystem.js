
// B"H

/**
 * @file MouthSystem.js
 * @description
 * ============================================================================
 * CHAPTER: THE MOUTH THAT SPOKE BY TEXT RHYTHM
 * ============================================================================
 *
 * The mouth responds to speaking, punctuation, happiness, surprise, and simple
 * phoneme-like pulses from text.
 *
 * @module MouthSystem
 */

/**
 * @class MouthSystem
 * @description
 * Samples and draws mouth shapes.
 */
export class MouthSystem {
  /**
   * Samples mouth pose.
   *
   * @param {Object} character - Character.
   * @param {number} time - Time.
   * @returns {Object} Mouth pose.
   */
  static sample(character = {}, time = 0) {
    const perf = character.currentPerformance || {};
    const text = String(character.dialogue || character.speech || '');
    const speaking = Boolean(character.speaking || perf.speech === 'talk' || text);
    const emotion = perf.emotion || character.emotion || 'calm';
    const beat = speaking ? Math.abs(Math.sin(time * 0.014)) : 0;
    const charIndex = text ? Math.floor((time * 0.012) % text.length) : 0;
    const ch = text[charIndex] || '';
    const vowelWide = /[eEiI]/.test(ch) ? 0.28 : /[oOuU]/.test(ch) ? -0.14 : 0;

    return {
      open: speaking ? 0.18 + beat * 0.72 : emotion === 'surprised' ? 0.55 : 0.08,
      wide: emotion === 'happy' ? 0.42 : vowelWide,
      smile: emotion === 'happy' ? 0.75 : 0,
      frown: emotion === 'sad' ? 0.5 : 0
    };
  }

  /**
   * Draws mouth.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {number} x - X.
   * @param {number} y - Y.
   * @param {number} scale - Scale.
   * @param {Object} pose - Mouth pose.
   * @param {string} color - Color.
   * @returns {void}
   */
  static draw(ctx, x, y, scale, pose, color = '#7f1d1d') {
    const w = (16 + pose.wide * 22 + pose.smile * 10) * scale;
    const h = Math.max(3, (4 + pose.open * 13) * scale);
    const curve = (pose.smile - pose.frown) * 5 * scale;

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.quadraticCurveTo(x, y + h + curve, x + w / 2, y);
    ctx.quadraticCurveTo(x, y + h * 0.45, x - w / 2, y);
    ctx.fill();

    if (h > 7 * scale) {
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.fillRect(x - w * 0.25, y + h * 0.18, w * 0.5, Math.max(1, h * 0.12));
    }
    ctx.restore();
  }
}
