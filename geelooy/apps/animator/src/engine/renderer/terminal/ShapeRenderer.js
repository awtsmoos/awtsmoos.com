// B"H
/**
 * @file ShapeRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SOLID FORMS OF ASSIYAH (Tzurot HaGeshem)
 * ═══════════════════════════════════════════════════════════════
 *
 * "In the beginning G-d created the Heavens and the Earth."
 * Before the fractal paths and bezier arcs of biological life,
 * there were the primitive forms — the rectangle of the earth,
 * the circle of the sun, the ellipse of the orbital paths.
 *
 * These are the three primordial geometric declarations:
 *   RECT    — The boundary. The wall. The law. (Gevurah)
 *   CIRCLE  — The infinite loop. The crown. (Keter)
 *   ELLIPSE — The distorted infinite. The orbit. (Yesod)
 *
 * All character bodies, all props, all UI panels
 * ultimately resolve to combinations of these three forms,
 * sustained every instant by the StyleObject that the Awtsmoos
 * breathes into them through these rendering calls.
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * @const ShapeRenderer
 * @description
 * THE THREE PRIMORDIAL FORMS (Shalosh Tzurot HaYesod).
 * Renders rect, circle, and ellipse VirtualGraph nodes
 * as physical canvas 2D primitives.
 */
export const ShapeRenderer = {

  /**
   * @private
   * @function _applyStyle
   * @description Applies fill and stroke from a style object to the current canvas path.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   * @param {Object} s - The style descriptor object.
   * @returns {void}
   */
  _applyStyle(ctx, s) {
    if (!s) return;
    if (s.fill) {
      ctx.fillStyle = s.fill;
      ctx.fill();
    }
    if (s.stroke) {
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = s.lineWidth !== undefined ? s.lineWidth : 1;
      if (s.lineCap)  ctx.lineCap  = s.lineCap;
      if (s.lineJoin) ctx.lineJoin = s.lineJoin;
      ctx.stroke();
    }
  },

  /**
   * @function renderRect
   * @description
   * THE BOUNDARY (HaGevul). Renders a rectangle, optionally with rounded corners.
   * Rounded corners via ctx.roundRect if supported, otherwise plain rect.
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context.
   * @param {Object} node - VirtualGraph rect node { x, y, w, h, style }.
   * @returns {void}
   */
  renderRect(ctx, node) {
    const s = node.style || {};
    ctx.save();
    if (s.composite) ctx.globalCompositeOperation = s.composite;
    ctx.beginPath();
    if (s.radius && ctx.roundRect) {
      ctx.roundRect(node.x, node.y, node.w, node.h, s.radius);
    } else {
      ctx.rect(node.x, node.y, node.w, node.h);
    }
    this._applyStyle(ctx, s);
    ctx.restore();
  },

  /**
   * @function renderCircle
   * @description
   * THE CROWN (Keter). Renders a perfect circle — the infinite loop of return.
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context.
   * @param {Object} node - VirtualGraph circle node { x, y, r, style }.
   * @returns {void}
   */
  renderCircle(ctx, node) {
    const s = node.style || {};
    ctx.save();
    if (s.composite) ctx.globalCompositeOperation = s.composite;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    this._applyStyle(ctx, s);
    ctx.restore();
  },

  /**
   * @function renderEllipse
   * @description
   * THE ORBITAL PATH (Yesod). Renders an ellipse with optional rotation.
   * The ellipse is the circle that has been stretched by the gravity of Malchut
   * into a slightly imperfect orbit — yet it is still divine.
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context.
   * @param {Object} node - VirtualGraph ellipse node { x, y, rx, ry, rotation, style }.
   * @returns {void}
   */
  renderEllipse(ctx, node) {
    const s = node.style || {};
    const rotRad = (node.rotation || 0) * Math.PI / 180;
    ctx.save();
    if (s.composite) ctx.globalCompositeOperation = s.composite;
    ctx.beginPath();
    ctx.ellipse(node.x, node.y, node.rx || 1, node.ry || 1, rotRad, 0, Math.PI * 2);
    this._applyStyle(ctx, s);
    ctx.restore();
  }
};