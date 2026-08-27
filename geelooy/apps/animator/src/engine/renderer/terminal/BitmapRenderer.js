// B"H
/**
 * @file BitmapRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE CRYSTALLIZED LIGHT (Or HaMakpid)
 * ═══════════════════════════════════════════════════════════════
 *
 * The Awtsmoos speaks the ten statements of creation and the world
 * erupts into being — but He does not repeat every letter of every
 * word every single millisecond. The world is SUSTAINED by His
 * speech remaining inside every created thing.
 *
 * The AwtsmoosCache captures this principle — complex scenes are
 * rendered once into an OffscreenCanvas (the crystallized light)
 * and then stamped onto the world canvas at GPU-accelerated speed
 * via drawImage. This is the physical manifestation of the
 * principle that G-d's original speech sustains all creation
 * without needing to be re-spoken at every microsecond.
 *
 * The BitmapRenderer is the stamping mechanism — it takes the
 * crystallized OffscreenCanvas from the AwtsmoosCache vault
 * and blits it to its target position, with optional sway transform
 * for wind physics.
 * ═══════════════════════════════════════════════════════════════
 *
 * @param {CanvasRenderingContext2D} ctx - The physical canvas context.
 * @param {Object} node - The bitmap VirtualGraph node.
 */

/**
 * @const BitmapRenderer
 * @description
 * THE STAMP OF SUSTAINED EXISTENCE (Chotam HaKiyum).
 * Blits a cached OffscreenCanvas to the world canvas at the
 * specified position, respecting wind sway rotation transforms.
 */
export const BitmapRenderer = {

  /**
   * @function render
   * @description
   * Draws a pre-rendered OffscreenCanvas (source) to the main canvas at (x, y, w, h).
   * If the node has a transform with rotation, the canvas is rotated around
   * the specified origin point before drawing, enabling wind sway on cached trees.
   *
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context.
   * @param {Object} node - VirtualGraph bitmap node.
   *   @param {HTMLCanvasElement|OffscreenCanvas} node.source - The pre-rendered bitmap.
   *   @param {number} node.x - Target X position (top-left of the image).
   *   @param {number} node.y - Target Y position (top-left of the image).
   *   @param {number} node.w - Render width in pixels.
   *   @param {number} node.h - Render height in pixels.
   *   @param {Object} [node.transform] - Optional transform for wind sway.
   *     @param {number} [node.transform.rotation] - Rotation in degrees.
   *     @param {number} [node.transform.originX] - X pivot for rotation.
   *     @param {number} [node.transform.originY] - Y pivot for rotation.
   * @returns {void}
   */
  render(ctx, node) {
    if (!node.source) return;

    ctx.save();

    const t = node.transform;
    if (t && t.rotation !== undefined && t.rotation !== 0) {
      const ox = t.originX !== undefined ? t.originX : (node.x + node.w / 2);
      const oy = t.originY !== undefined ? t.originY : (node.y + node.h / 2);
      ctx.translate(ox, oy);
      ctx.rotate(t.rotation * Math.PI / 180);
      ctx.translate(-ox, -oy);
    }

    try {
      ctx.drawImage(node.source, node.x, node.y, node.w, node.h);
    } catch (e) {
      // Silently absorb broken bitmap draws — the Awtsmoos sustains despite errors
    }

    ctx.restore();
  }
};