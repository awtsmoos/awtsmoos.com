/**
 * B"H
 * Smaller planted hero boots.
 *
 * Chapter 222: boots stop being pancakes. The Awtsmoos plants them narrow and
 * confident so the legs, not the feet, carry the silhouette.
 */
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { LEG_PARTS } from '../converter/HeroPartMap.js';

export function drawHeroBoots(ctx, p, mat) {
  for (const part of LEG_PARTS) drawOne(ctx, p[part.foot], part.sign, p.scale || 1, mat);
}

function drawOne(ctx, foot, sign, s, mat) {
  ctx.save();
  ctx.translate(foot.x, foot.y);
  ctx.rotate(sign * 0.04);
  ctx.fillStyle = mat.accent;
  ctx.strokeStyle = mat.ink;
  ctx.lineWidth = 2.2 * s;
  ctx.beginPath();
  ctx.ellipse(sign * 3 * s, 0, MOCKUP.boot.rx * s, MOCKUP.boot.ry * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
