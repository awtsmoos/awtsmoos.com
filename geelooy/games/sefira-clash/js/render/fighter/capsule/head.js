/**
 * B"H
 * Authored hero helmet.
 *
 * Chapter 169: no smile remains. The helmet is glossy, heavy, and attached;
 * the visor alone tells the fighter's direction like a flash of green lightning.
 */
import { clamp } from './math.js';

export function drawCapsuleHead(ctx, p, color, language = {}) {
  const lean = clamp(language.lean || 0, -0.12, 0.12);
  ctx.save();
  ctx.translate(p.head.x, p.head.y);
  ctx.rotate(lean * 0.08);
  drawHelmet(ctx, color);
  drawVisor(ctx, color, p.face);
  ctx.restore();
}

function drawHelmet(ctx, color) {
  ctx.fillStyle = 'rgba(2,3,7,1)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 23, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath();
  ctx.ellipse(-7, -10, 6, 3.4, -0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVisor(ctx, color, face) {
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,.92)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-16, -3);
  ctx.quadraticCurveTo(face * 2, 8, face * 19, -7);
  ctx.lineTo(face * 15, 5);
  ctx.quadraticCurveTo(face * 0, 12, -15, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
