
// B"H

/**
 * @file BrowRenderer.js
 * @description
 * ============================================================================
 * CHAPTER: THE CURVED BROW THAT STOPPED BEING A DEAD LINE
 * ============================================================================
 *
 * Renders brows as expressive curves with thickness, tilt, arch, pinch, shadow,
 * and optional wrinkle lines.
 *
 * @module BrowRenderer
 */

/**
 * @class BrowRenderer
 * @description
 * Direct canvas curved eyebrow renderer.
 */
export class BrowRenderer {
  /**
   * Draws both brows.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {Object} args - Args.
   * @returns {void}
   */
  static draw(ctx, args) {
    const { x, y, scale, pose, color } = args;
    this.one(ctx, x - 12 * scale, y, -1, pose.left, pose.center, scale, color);
    this.one(ctx, x + 12 * scale, y, 1, pose.right, pose.center, scale, color);
    this.wrinkles(ctx, x, y, pose, scale, color);
  }

  /**
   * Draws one brow curve.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {number} x - Center x.
   * @param {number} y - Base y.
   * @param {number} side - Side.
   * @param {Object} b - Brow side pose.
   * @param {Object} center - Center pose.
   * @param {number} scale - Scale.
   * @param {string} color - Color.
   * @returns {void}
   */
  static one(ctx, x, y, side, b, center, scale, color) {
    const pinch = (center.pinch || 0) * 5 * scale;
    const compression = (center.compression || 0) * 3 * scale;
    const innerLift = (b.innerLift || 0) * -15 * scale;
    const outerLift = (b.outerLift || 0) * -15 * scale;
    const arch = (b.arch || 0.2) * -10 * scale;
    const tilt = (b.tilt || 0) * 8 * scale;
    const yOffset = (b.yOffset || 0) * scale;
    const inner = { x: x - side * (8 * scale - pinch), y: y + innerLift + yOffset + tilt };
    const outer = { x: x + side * (11 * scale + compression), y: y + outerLift + yOffset - tilt };
    const mid = { x: (inner.x + outer.x) * 0.5, y: (inner.y + outer.y) * 0.5 + arch };

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = Math.max(1, 5 * scale * (b.thickness || 1));
    ctx.beginPath();
    ctx.moveTo(inner.x, inner.y + 2 * scale);
    ctx.quadraticCurveTo(mid.x, mid.y + 2 * scale, outer.x, outer.y + 2 * scale);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, 3.4 * scale * (b.thickness || 1));
    ctx.beginPath();
    ctx.moveTo(inner.x, inner.y);
    ctx.quadraticCurveTo(mid.x, mid.y, outer.x, outer.y);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws wrinkles from brow intensity.
   *
   * @param {CanvasRenderingContext2D} ctx - Context.
   * @param {number} x - Head x.
   * @param {number} y - Brow y.
   * @param {Object} pose - Brow pose.
   * @param {number} scale - Scale.
   * @param {string} color - Color.
   * @returns {void}
   */
  static wrinkles(ctx, x, y, pose, scale, color) {
    const amount = pose.center?.wrinkleIntensity || pose.center?.verticalFold || 0;
    if (amount <= 0.08) return;

    ctx.save();
    ctx.globalAlpha = Math.min(0.55, amount);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + i * 4 * scale, y - 2 * scale);
      ctx.lineTo(x + i * 3 * scale, y + 8 * scale);
      ctx.stroke();
    }
    ctx.restore();
  }
}
