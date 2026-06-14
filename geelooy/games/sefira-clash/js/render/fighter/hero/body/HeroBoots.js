/**
 * B"H
 * Sculpted hero boots.
 *
 * Chapter 203: boots become heavy anchors, flattening into the platform with
 * mockup confidence.
 */
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { LEG_PARTS } from '../converter/HeroPartMap.js';

export function drawHeroBoots(ctx, p, mat) {
  for (const part of LEG_PARTS) drawOne(ctx, p[part.foot], part.sign, p.scale || 1, mat);
}

function drawOne(ctx, foot, sign, s, mat) {
  ctx.save();
  ctx.translate(foot.x, foot.y);
  ctx.rotate(sign * .06);
  ctx.fillStyle = mat.accent;
  ctx.strokeStyle = mat.ink;
  ctx.lineWidth = 2.8 * s;
  ctx.beginPath();
  ctx.ellipse(sign * 5 * s, 0, MOCKUP.boot.rx * s, MOCKUP.boot.ry * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
