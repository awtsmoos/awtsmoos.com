import { signaturePoints } from './generatorMetrics.js';
import { radialGlow } from '../lighting/glow.js';

/**
 * B"H — Sefirotic signature chart. The points are connected like a small
 * constellation of the fighter's nature: range, power, speed, recovery.
 */
export function drawSignature(ctx, fighter, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) * .34;
  const pts = signaturePoints(fighter, cx, cy, r);
  drawWeb(ctx, cx, cy, r, pts.length);
  ctx.fillStyle = 'rgba(230,190,70,.42)';
  ctx.strokeStyle = '#f5d66d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  for (const p of pts) radialGlow(ctx, p.x, p.y, 13, 'rgba(245,214,109,.55)');
  ctx.fillStyle = '#fff3bd';
  ctx.font = '10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(fighter.dna.sefirah.toUpperCase(), cx, y + 14);
  ctx.textAlign = 'start';
}

function drawWeb(ctx, cx, cy, r, count) {
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 3; ring++) {
    ctx.beginPath();
    for (let i = 0; i <= count; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / count;
      const rr = r * ring / 3;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
}
