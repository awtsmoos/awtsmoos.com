/** B"H — V3 helmet shell. */
import { V3_STYLE } from '../CharacterStyle.js';
export function drawHelmet(ctx, p, mat) {
  ctx.save(); ctx.translate(p.head.x, p.head.y);
  const g = ctx.createRadialGradient(-7, -10, 3, 0, 0, V3_STYLE.head.ry);
  g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.3, mat.soft); g.addColorStop(1, mat.shell);
  ctx.fillStyle = g; ctx.strokeStyle = mat.accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 0, V3_STYLE.head.rx, V3_STYLE.head.ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
