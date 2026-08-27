// B"H
/**
 * @file PathRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE JOURNEY OF THE SPARK (Merhav HaNitzotz)
 * ═══════════════════════════════════════════════════════════════
 *
 * Every path is a journey of a divine spark through the ten Sefirot.
 * It begins with a moveTo (the first thought, Keter),
 * it curves through quadratics and beziers (Chokhmah, Binah, the seven below),
 * and it ends with a lineTo or closePath (Malchut — the final revealed form).
 *
 * The Hebrew letters that were used by the Awtsmoos in the six days of creation
 * trace these exact bezier arcs through reality — the letters Aleph, Beis, Nun
 * that form the word "Even" (stone) are the control points of a path
 * that causes the stone's physical shape to persist in this instant.
 *
 * Strip the path, and the stone — and all existence — returns to void.
 * ═══════════════════════════════════════════════════════════════
 *
 * @param {CanvasRenderingContext2D} ctx - The physical canvas context.
 * @param {Object} node - The path VirtualGraph node with points array and style.
 */

/**
 * @const PathRenderer
 * @description
 * THE SCRIBE OF GEOMETRY (Sofer HaGiyometriya).
 * Converts an array of abstract path point descriptors into real
 * canvas strokes and fills, manifesting form from pure data.
 */
export const PathRenderer = {

  /**
   * @function render
   * @description
   * Interprets the points array of a path node and executes the
   * appropriate canvas 2D API calls to trace and fill/stroke the path.
   *
   * Supported point types:
   *   move    — moveTo(x, y)
   *   line    — lineTo(x, y)
   *   quad    — quadraticCurveTo(cx, cy, x, y)
   *   bezier  — bezierCurveTo(c1x, c1y, c2x, c2y, x, y)
   *   arc     — arc(cx, cy, r, startAngle, endAngle, ccw)
   *   close   — closePath()
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context.
   * @param {Object} node - VirtualGraph path node { points: Array, style: Object }.
   * @returns {void}
   */
  render(ctx, node) {
    if (!node.points || node.points.length === 0) return;

    const s = node.style || {};

    ctx.save();

    if (s.composite) ctx.globalCompositeOperation = s.composite;

    ctx.beginPath();

    for (let i = 0; i < node.points.length; i++) {
      const pt = node.points[i];
      if (!pt) continue;

      switch (pt.type) {
        case 'move':
          ctx.moveTo(pt.x, pt.y);
          break;
        case 'line':
          ctx.lineTo(pt.x, pt.y);
          break;
        case 'quad':
          ctx.quadraticCurveTo(pt.cx, pt.cy, pt.x, pt.y);
          break;
        case 'bezier':
          ctx.bezierCurveTo(pt.c1x, pt.c1y, pt.c2x, pt.c2y, pt.x, pt.y);
          break;
        case 'arc':
          ctx.arc(pt.cx, pt.cy, pt.r, pt.startAngle || 0, pt.endAngle || Math.PI * 2, pt.ccw || false);
          break;
        case 'close':
          ctx.closePath();
          break;
        default:
          break;
      }
    }

    if (s.close) ctx.closePath();

    if (s.fill) {
      ctx.fillStyle = s.fill;
      if (s.fillOpacity !== undefined) {
        const prev = ctx.globalAlpha;
        ctx.globalAlpha = s.fillOpacity;
        ctx.fill(s.fillRule || 'nonzero');
        ctx.globalAlpha = prev;
      } else {
        ctx.fill(s.fillRule || 'nonzero');
      }
    }

    if (s.stroke) {
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = s.lineWidth !== undefined ? s.lineWidth : 1;
      if (s.lineCap)  ctx.lineCap  = s.lineCap;
      if (s.lineJoin) ctx.lineJoin = s.lineJoin;
      if (s.lineDash) ctx.setLineDash(s.lineDash);
      ctx.stroke();
      if (s.lineDash) ctx.setLineDash([]);
    }

    ctx.restore();
  }
};