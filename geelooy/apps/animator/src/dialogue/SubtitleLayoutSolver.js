// B"H

/**
 * @file SubtitleLayoutSolver.js
 * @description
 * Chapter Twenty-Two: The words descended into the theater.
 *
 * Subtitles were floating like debug labels in the sky. This solver makes them
 * behave like film subtitles: centered, readable, above the editor dock, and
 * scaled to the actual screen vessel.
 *
 * @module SubtitleLayoutSolver
 */

/**
 * @class SubtitleLayoutSolver
 * @description Screen-space subtitle placement.
 */
export class SubtitleLayoutSolver {
  /**
   * Solves screen-space card.
   *
   * @param {Object} ctx - Render context.
   * @param {Object} dialogue - Dialogue.
   * @returns {Object} Layout.
   */
  static solve(ctx, dialogue) {
    const w = Math.max(1, ctx.width || ctx.canvas?.width || window.innerWidth || 800);
    const h = Math.max(1, ctx.height || ctx.canvas?.height || window.innerHeight || 600);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const dock = this.dockHeight() * dpr;
    const mobile = w <= 900 || h > w;
    const margin = (mobile ? 18 : 32) * dpr;
    const cardW = Math.min(w - margin * 2, (mobile ? 640 : 760) * dpr);
    const lines = this.wrap(dialogue.text, mobile ? 34 : 58);
    const lineH = (mobile ? 21 : 24) * dpr;
    const cardH = Math.max((mobile ? 56 : 64) * dpr, lines.length * lineH + 24 * dpr);
    const y = Math.max(24 * dpr, h - dock - cardH - 28 * dpr);

    return {
      x: (w - cardW) / 2,
      y,
      w: cardW,
      h: cardH,
      lines
    };
  }

  /** @returns {number} Dock height in CSS px. */
  static dockHeight() {
    const css = getComputedStyle(document.documentElement);
    const raw = parseFloat(css.getPropertyValue('--aw-dock-height'));
    return Number.isFinite(raw) ? raw : 138;
  }

  /**
   * Wraps text.
   *
   * @param {string} text - Text.
   * @param {number} limit - Character limit.
   * @returns {Array<string>} Lines.
   */
  static wrap(text, limit) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';

    words.forEach(word => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > limit && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });

    if (current) lines.push(current);
    return lines.slice(0, 3);
  }
}
