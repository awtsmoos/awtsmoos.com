
// B"H

/**
 * @file PostProcessor.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 2: THE FINAL SEAL (Chotam HaSof)
 * ═══════════════════════════════════════════════════════════════
 *
 * "And there was evening, and there was morning." — Bereishis 1:5
 *
 * The night overlay must DARKEN the scene, not ANNIHILATE it.
 * The former implementation used `globalCompositeOperation = 'multiply'`,
 * which when applied to a near-black background (#050508) produces
 * mathematically pure black — the entire scene is erased at night!
 *
 * THE POEM OF THE MULTIPLY ERROR:
 * "Multiply" said the code, and darkened the sky,
 * But on black times black, the whole scene would die!
 * The characters vanished, the world went to naught,
 * Because 'multiply' on darkness leaves nothing but thought!
 *
 * RECTIFICATION: We use 'source-over' compositing with a
 * dark, semi-transparent fill. This correctly layers a dark
 * blue-black veil over the scene without destroying it.
 *
 * @class PostProcessor
 */
export class PostProcessor {
  /**
   * @function apply
   * @description Applies all post-processing passes to the final frame.
   * @param {CanvasRenderingContext2D} ctx       - The 2D drawing context.
   * @param {number}                  width      - Canvas display width in CSS px.
   * @param {number}                  height     - Canvas display height in CSS px.
   * @param {number}                  timeOfDay  - 0.0 (midnight) → 1.0 (high noon).
   * @returns {void}
   */
  static apply(ctx, width, height, timeOfDay) {
    this._applyNightVeil(ctx, width, height, timeOfDay);
  }

  /**
   * @function _applyNightVeil
   * @description
   * Overlays a dark-blue semi-transparent rectangle using 'source-over'
   * compositing to simulate the dimming of night without destroying
   * any underlying pixel colour data.
   *
   * THE HYMN OF THE NIGHT VEIL:
   * As time descends and midnight draws near,
   * A veil of deep blue makes the daylight disappear!
   * But 'source-over' is kind — it dims, doesn't erase,
   * The characters still glow in their digitised space!
   *
   * @param {CanvasRenderingContext2D} ctx      - Canvas context.
   * @param {number}                  width     - Display width in CSS px.
   * @param {number}                  height    - Display height in CSS px.
   * @param {number}                  timeOfDay - 0.0 (night) to 1.0 (noon).
   * @returns {void}
   */
  static _applyNightVeil(ctx, width, height, timeOfDay) {
    // timeOfDay 0 = full night, 1 = full noon.
    // At noon the veil has 0 alpha. At midnight it peaks at ~0.65.
    const opacity = Math.max(0, (1 - timeOfDay) * 0.65);
    if (opacity <= 0) return;

    ctx.save();
    // CORRECTED: 'source-over' correctly layers the veil on top.
    // 'multiply' was the catastrophic bug — it turned black scenes to void.
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(14, 14, 35, ${opacity})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
