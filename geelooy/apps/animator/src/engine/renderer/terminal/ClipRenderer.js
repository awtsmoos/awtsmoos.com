// B"H
/**
 * @file ClipRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE TZIMTZUM OF LIGHT (HaTzimtzum HaRishon)
 * ═══════════════════════════════════════════════════════════════
 *
 * Before creation, the Infinite Light (Ohr Ein Sof) filled all space.
 * There was no room for anything else to exist.
 * The first act of creation was the Tzimtzum — the contraction —
 * where the Awtsmoos withdrew His light from a circular space,
 * leaving a void (the Chalal) into which the world could be placed.
 *
 * The ClipRenderer IS the Tzimtzum.
 * It defines a boundary (the clip path) and withdraws the rendering
 * light from outside that boundary, allowing only what is within
 * the sacred geometric region to be visible to the observer.
 *
 * Everything outside the clip is darkness — Tohu Va-Vohu.
 * Everything inside the clip receives the light of creation.
 * ═══════════════════════════════════════════════════════════════
 *
 * @param {CanvasRenderingContext2D} ctx - The physical canvas context.
 * @param {Object} node - The clip VirtualGraph node.
 * @param {Function} renderFn - The recursive CanvasTerminal render dispatcher.
 */

/**
 * @const ClipRenderer
 * @description
 * THE BOUNDARY OF LIGHT (Gvul HaOr).
 * Clips a rectangular or path-defined region and renders
 * all children within that bounded sacred space.
 */
export const ClipRenderer = {

  /**
   * @function render
   * @description
   * Builds the clipping path from the clipPathPoints array,
   * activates the clip, then renders all child nodes within it.
   * The canvas state is saved and restored around the operation
   * so surrounding geometry is unaffected.
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context.
   * @param {Object} node - VirtualGraph clip node { transform, clipPathPoints, children }.
   *   @param {Object} [node.transform] - Optional translation before clipping.
   *   @param {Array}  node.clipPathPoints - Array of path points defining the clip boundary.
   *   @param {Array}  node.children - Child VirtualGraph nodes to render inside the clip.
   * @param {Function} renderFn - Bound CanvasTerminal.render for recursive dispatch.
   * @returns {void}
   */
  render(ctx, node, renderFn) {
    if (!node.clipPathPoints || node.clipPathPoints.length === 0) return;

    ctx.save();

    const t = node.transform;
    if (t) {
      if (t.x || t.y) ctx.translate(t.x || 0, t.y || 0);
      if (t.rotation) ctx.rotate(t.rotation * Math.PI / 180);
      if (t.scaleX !== undefined || t.scaleY !== undefined) {
        ctx.scale(t.scaleX !== undefined ? t.scaleX : 1, t.scaleY !== undefined ? t.scaleY : 1);
      }
    }

    ctx.beginPath();

    const pts = node.clipPathPoints;
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      if (!pt) continue;
      switch (pt.type) {
        case 'move':    ctx.moveTo(pt.x, pt.y); break;
        case 'line':    ctx.lineTo(pt.x, pt.y); break;
        case 'quad':    ctx.quadraticCurveTo(pt.cx, pt.cy, pt.x, pt.y); break;
        case 'bezier':  ctx.bezierCurveTo(pt.c1x, pt.c1y, pt.c2x, pt.c2y, pt.x, pt.y); break;
        case 'close':   ctx.closePath(); break;
        default: break;
      }
    }

    ctx.closePath();
    ctx.clip();

    const children = node.children;
    if (children && Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        if (children[i]) renderFn(ctx, children[i]);
      }
    }

    ctx.restore();
  }
};