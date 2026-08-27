
// B"H

/**
 * @file HitRegionProbe.js
 * @description
 * ============================================================================
 * CHAPTER: THE OUTLINE AROUND THE BODY'S SECRET NAME
 * ============================================================================
 *
 * A selectable character must leave a visible signature. This probe draws the
 * rectangles the editor will test, exposing missing, offscreen, or buried hits.
 *
 * @module HitRegionProbe
 */

/**
 * @class HitRegionProbe
 * @description
 * Paints hit regions.
 */
export class HitRegionProbe {
  /**
   * Paints all regions.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {Array<Object>} regions - Hit region list.
   * @param {string|null} selectedId - Selected entity id.
   * @returns {void}
   */
  static paint(ctx, regions, selectedId) {
    if (!ctx || !Array.isArray(regions)) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const r of regions) {
      ctx.strokeStyle = r.id === selectedId ? '#ffdf3d' : '#00f0ff';
      ctx.lineWidth = r.id === selectedId ? 4 : 2;
      ctx.strokeRect(r.x, r.y, r.width, r.height);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = '12px monospace';
      ctx.fillText(r.id + ':' + r.part, r.x + 4, Math.max(12, r.y - 4));
    }
    ctx.restore();
  }
}
