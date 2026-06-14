/**
 * B"H
 * Sculpted hero gloves.
 *
 * Chapter 202: the fist is no longer a bead; it is the readable punctuation of
 * every strike.
 */
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { ARM_PARTS } from '../converter/HeroPartMap.js';

export function drawHeroGloves(ctx, p, mat) {
  for (const part of ARM_PARTS) drawOne(ctx, p[part.hand], p.scale || 1, mat);
}

function drawOne(ctx, h, s, mat) {
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.fillStyle = mat.accent;
  ctx.strokeStyle = mat.ink;
  ctx.lineWidth = 2.8 * s;
  ctx.beginPath();
  ctx.ellipse(0, 0, MOCKUP.glove.rx * s, MOCKUP.glove.ry * s, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = .24;
  ctx.fillStyle = mat.glint;
  ctx.beginPath();
  ctx.ellipse(-4 * s, -4 * s, 4 * s, 2 * s, -.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
