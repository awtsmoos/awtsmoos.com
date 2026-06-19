
// B"H

/**
 * @file CutoutShader.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 16: THE PURGE OF ALL SHADOWS (Biur HaTzlalim)
 * THE DEAD-PARAMETER RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "ABSOLUTELY NO SHADOWS. NO GRADIENTS. NO GLOW.
 *  Just pure, flat, geometric, God-given colour."
 *
 * THE BUG OF THE DEAD PARAMETERS:
 * The former CutoutShader.apply(ctx, elevation, opacity) accepted
 * two parameters (elevation and opacity) that it never used at all.
 * This was a misleading API — callers might think they were setting
 * shadow elevation or layer opacity, but they were speaking to void.
 *
 * THE POEM OF THE SILENT PARAMETERS:
 * Two arguments were passed and neither was heard,
 * The function took 'elevation' but swallowed the word!
 * Opacity arrived at the door and knocked twice,
 * But the function ignored it — it wasn't being nice!
 * Now the API is honest: one argument, the ctx,
 * And shadows are gone in the most permanent flux!
 *
 * RECTIFICATION: Removed dead parameters. The function signature
 * is now honest: apply(ctx) and clear(ctx) only.
 *
 * @class CutoutShader
 */
export class CutoutShader {
  /**
   * @function apply
   * @description
   * Absolutely nullifies all shadow state on the context.
   * Call this before drawing any filled geometry to prevent
   * accidental shadow bleed-through from other draw calls.
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context to sanitise.
   * @returns {void}
   */
  static apply(ctx) {
    ctx.shadowColor   = 'transparent';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * @function clear
   * @description
   * Alias for apply(). Semantically useful after shadow-drawing code blocks.
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context to clear.
   * @returns {void}
   */
  static clear(ctx) {
    ctx.shadowColor   = 'transparent';
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}
