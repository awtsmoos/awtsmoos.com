/** B"H — V3 visor blade. */
export function drawVisor(ctx, p, mat) {
  const face = p.face; ctx.save(); ctx.translate(p.head.x, p.head.y);
  ctx.fillStyle = mat.accent; ctx.strokeStyle = mat.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-15, -2); ctx.quadraticCurveTo(face * 2, 8, face * 18, -7); ctx.lineTo(face * 14, 4);
  ctx.quadraticCurveTo(0, 11, -14, 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
