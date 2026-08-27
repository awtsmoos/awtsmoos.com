// B"H
/**
 * @file TextRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SPOKEN WORD MADE VISIBLE (HaDibbur HaNir'eh)
 * ═══════════════════════════════════════════════════════════════
 *
 * "The heavens were made by the word of G-d,
 *  and all their host by the breath of His mouth." — Tehillim 33:6
 *
 * Speech bubbles. Labels. Score displays. Debug readouts.
 * All of these are the Spoken Word descending from the realm of
 * Atzilut (pure intention) through Beriah (formation of the letter)
 * through Yetzirah (the shaping of the sound) into Assiyah
 * (the physical pixel on the screen that carries the meaning).
 *
 * The TextRenderer is the Malchut of the CanvasTerminal —
 * the final, revealed level where the divine speech becomes
 * something a human eye can read and understand.
 * ═══════════════════════════════════════════════════════════════
 *
 * @param {CanvasRenderingContext2D} ctx - The physical canvas context.
 * @param {Object} node - The text VirtualGraph node.
 */

/**
 * @const TextRenderer
 * @description
 * THE MOUTH OF MALCHUT (Peh D'Malchut).
 * Renders text nodes to the canvas with full style support.
 */
export const TextRenderer = {

  /**
   * @function render
   * @description
   * Renders a text string at the given coordinates using the provided style.
   * Supports fill color, font, text alignment, baseline, optional stroke,
   * and letter spacing via character-by-character rendering when needed.
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
   * @param {Object} node - VirtualGraph text node { text, x, y, style }.
   *   @param {string} node.text - The string content to render.
   *   @param {number} node.x - The X coordinate anchor.
   *   @param {number} node.y - The Y coordinate anchor.
   *   @param {Object} node.style - Style object.
   *     @param {string} [node.style.font] - CSS font string.
   *     @param {string} [node.style.fill] - Fill color string.
   *     @param {string} [node.style.stroke] - Optional stroke color.
   *     @param {number} [node.style.lineWidth] - Stroke width if stroke is set.
   *     @param {string} [node.style.align] - 'left' | 'center' | 'right'.
   *     @param {string} [node.style.baseline] - 'top' | 'middle' | 'alphabetic' | 'bottom'.
   *     @param {number} [node.style.maxWidth] - Optional max width for wrapping.
   * @returns {void}
   */
  render(ctx, node) {
    if (!node.text) return;

    const s = node.style || {};

    ctx.save();

    ctx.font      = s.font      || '16px sans-serif';
    ctx.textAlign = s.align     || 'left';
    ctx.textBaseline = s.baseline || 'middle';

    if (s.composite) ctx.globalCompositeOperation = s.composite;

    const text = String(node.text);
    const x = node.x;
    const y = node.y;
    const maxW = s.maxWidth || undefined;

    if (s.stroke) {
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth   = s.lineWidth || 1;
      ctx.strokeText(text, x, y, maxW);
    }

    if (s.fill !== undefined) {
      ctx.fillStyle = s.fill;
    } else {
      ctx.fillStyle = '#ffffff';
    }

    ctx.fillText(text, x, y, maxW);

    ctx.restore();
  }
};