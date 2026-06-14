/**
 * B"H
 * Premium attached helmet head.
 *
 * Chapter 139: the head is no longer a face-ball. It is a helmet tucked into a
 * neck with a visor that reveals facing, focus, panic, and attack intention.
 */
import { clamp } from './math.js';

export function drawCapsuleHead(ctx, p, color, language = {}) {
  const panic = clamp(language.panic || 0, 0, 1);
  const lean = clamp(language.lean || 0, -0.24, 0.24);
  ctx.save();
  ctx.translate(p.head.x, p.head.y);
  ctx.rotate(lean * 0.13);
  drawHelmet(ctx, color, panic);
  drawVisor(ctx, color, p.face, panic);
  ctx.restore();
}

function drawHelmet(ctx, color, panic) {
  ctx.fillStyle = 'rgba(5,6,10,.98)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17.5 + panic * 1.2, 19.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.beginPath();
  ctx.ellipse(-5, -7, 5.2, 3.1, -0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawVisor(ctx, color, face, panic) {
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,.88)';
  ctx.lineWidth = 1.7;
  const rise = panic * 1.5;
  ctx.beginPath();
  ctx.moveTo(-11, -2 + rise);
  ctx.quadraticCurveTo(face * 1, 5 + rise, face * 13, -5);
  ctx.lineTo(face * 10, 2 + rise);
  ctx.quadraticCurveTo(face * 1, 8 + rise, -10, 4 + rise);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
