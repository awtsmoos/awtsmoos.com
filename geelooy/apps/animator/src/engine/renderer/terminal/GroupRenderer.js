
// B"H
/**
 * @file GroupRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE VESSEL OF VESSELS (Kli HaKelim)
 * ═══════════════════════════════════════════════════════════════
 *
 * "And He put the staves into the rings on the sides of the ark,
 *  to bear the ark." — Shemot 25:14
 *
 * A Group Node is the Ark — it holds within it all the sacred
 * objects. The GroupRenderer bears the Ark by applying a coordinate 
 * transform and recursively rendering every child soul within.
 * 
 * RECTIFICATION (Tikkun HaTzel): The shadows of sunset were failing 
 * to stretch because the Canvas API does not natively support `skewX` 
 * as a simple property. We have now mathematically injected the Tangent 
 * of the Skew Angle directly into the `ctx.transform` matrix. The 
 * temporal shadows will now streak across the pavement like giants.
 * 
 * @author Chariot of the Awtsmoos
 */

export const GroupRenderer = {
  /**
   * @function render
   * @description
   * Saves canvas state, applies transform (including skew), recurses into children.
   *
   * @param {CanvasRenderingContext2D} ctx - The physical 2D rendering context.
   * @param {Object} node - VirtualGraph group node { transform, children, style }.
   * @param {Function} renderFn - The CanvasTerminal.render dispatcher (bound).
   * @returns {void}
   */
  render(ctx, node, renderFn) {
    ctx.save();

    const t = node.transform;
    if (t) {
      if (t.x || t.y) {
        ctx.translate(t.x || 0, t.y || 0);
      }
      if (t.rotation) {
        ctx.rotate(t.rotation * Math.PI / 180);
      }
      
      const sx = t.scaleX !== undefined ? t.scaleX : 1;
      const sy = t.scaleY !== undefined ? t.scaleY : 1;
      
      // B"H - THE SKEW RECTIFICATION
      const skewXRad = t.skewX ? t.skewX * (Math.PI / 180) : 0;
      const skewYRad = t.skewY ? t.skewY * (Math.PI / 180) : 0;
      
      if (sx !== 1 || sy !== 1 || skewXRad !== 0 || skewYRad !== 0) {
        // ctx.transform(scaleX, skewY, skewX, scaleY, translateX, translateY)
        ctx.transform(
          sx, 
          Math.tan(skewYRad), 
          Math.tan(skewXRad), 
          sy, 
          0, 
          0
        );
      }
    }

    if (node.style && node.style.opacity !== undefined) {
      ctx.globalAlpha = node.style.opacity;
    }

    if (node.style && node.style.composite) {
      ctx.globalCompositeOperation = node.style.composite;
    }

    const children = node.children;
    if (children && Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child) renderFn(ctx, child);
      }
    }

    ctx.restore();
  }
};
