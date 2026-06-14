/**
 * B"H
 * Capsule gloves.
 *
 * Chapter 133: the hand becomes a glove, round and readable, so punches look
 * like impact instead of dots floating away from the arm.
 */
import { LIMB_BOUNDS } from './limbBounds.js';

export function drawGlove(ctx, p, color) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,.84)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, LIMB_BOUNDS.glove.radius, LIMB_BOUNDS.glove.radius * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
