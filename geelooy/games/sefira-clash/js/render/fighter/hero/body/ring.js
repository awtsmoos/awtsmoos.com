/**
 * B"H
 * Hero ring and contact shadow.
 *
 * Chapter 184: the hero stands on a glowing covenant with the stage.
 */
import { HERO } from '../style.js';

export function drawHeroRing(ctx, p, color, human) {
  const y = Math.max(p.leftFoot.y, p.rightFoot.y) + 5;
  ctx.save();
  ctx.globalAlpha = human ? 0.75 : 0.38;
  ctx.strokeStyle = color;
  ctx.lineWidth = human ? 3.5 : 2;
  ctx.beginPath();
  ctx.ellipse(p.pelvis.x, y, HERO.ring.rx, HERO.ring.ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(p.pelvis.x, y + 3, HERO.ring.rx * 0.8, HERO.ring.ry * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
