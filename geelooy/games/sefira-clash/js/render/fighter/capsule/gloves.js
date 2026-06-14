/**
 * B"H
 * Authored hero gloves.
 *
 * Chapter 171: the fist becomes visible from across the phone. Every punch now
 * carries a real glove, round and heavy like the mockup.
 */
import { LIMB_BOUNDS } from './limbBounds.js';

export function drawGlove(ctx, p, color) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,.88)';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, LIMB_BOUNDS.glove.radius, LIMB_BOUNDS.glove.radius * 0.95, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 0.26;
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.beginPath();
  ctx.ellipse(-4, -4, 3.7, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
