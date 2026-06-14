/**
 * B"H
 * Capsule boots.
 *
 * Chapter 134: the foot becomes a planted boot, not a wobbling oval. The
 * Awtsmoos lets every stance touch earth with confidence.
 */
import { LIMB_BOUNDS } from './limbBounds.js';

export function drawBoot(ctx, foot, side, color) {
  ctx.save();
  ctx.translate(foot.x, foot.y);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,.84)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(side * 3, 0, LIMB_BOUNDS.boot.width, LIMB_BOUNDS.boot.height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
