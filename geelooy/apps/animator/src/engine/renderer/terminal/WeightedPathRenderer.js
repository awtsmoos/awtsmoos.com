
// B"H
/**
 * @file WeightedPathRenderer.js
 * @brief THE DYNAMICS OF GEVURAH (Boundaries).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE PRESSURE OF THE PEN
 * ═══════════════════════════════════════════════════════════════
 * In the world of pure vector illustration, a line is not just a line.
 * It is a boundary that holds back the light. The outer contour of a 
 * soul must be thick and unyielding, while the inner wrinkles are 
 * light and ephemeral.
 * 
 * This module intercepts standard VirtualGraph paths and applies a 
 * `weightMultiplier` based on the node's 'isContour' metadata.
 * 
 * @author Chariot of the Awtsmoos
 */
export class WeightedPathRenderer {
  /**
   * @function render
   * @description Renders a path with variable stroke weight.
   * @param {CanvasRenderingContext2D} ctx - The physical plane.
   * @param {Object} node - Path node with metadata.
   */
  static render(ctx, node) {
    if (!node.points || node.points.length === 0) return;

    const s = node.style || {};
    const baseWeight = s.lineWidth || 2;
    
    // B"H - THE MULTIPLIER OF STRENGTH
    // Contour lines are 2.5x thicker to match the Rabbi Tzvi Freeman style.
    const finalWeight = node.isContour ? baseWeight * 2.5 : baseWeight;

    ctx.save();
    ctx.beginPath();

    node.points.forEach((pt, i) => {
      if (!pt) return;
      switch (pt.type) {
        case 'move':   ctx.moveTo(pt.x, pt.y); break;
        case 'line':   ctx.lineTo(pt.x, pt.y); break;
        case 'quad':   ctx.quadraticCurveTo(pt.cx, pt.cy, pt.x, pt.y); break;
        case 'bezier': ctx.bezierCurveTo(pt.c1x, pt.c1y, pt.c2x, pt.c2y, pt.x, pt.y); break;
        case 'close':  ctx.closePath(); break;
      }
    });

    if (s.fill) {
      ctx.fillStyle = s.fill;
      ctx.fill();
    }

    if (s.stroke) {
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = finalWeight;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.restore();
  }
}
