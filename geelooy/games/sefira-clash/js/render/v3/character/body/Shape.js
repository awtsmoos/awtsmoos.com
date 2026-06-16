/** B"H — V3 body primitive helpers. */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
export function segment(ctx, a, b, width, mat, dark = false) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy); if (len < 2) return;
  ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(Math.atan2(dy, dx));
  ctx.fillStyle = dark ? mat.soft : mat.accent; ctx.strokeStyle = mat.ink; ctx.lineWidth = 2;
  roundRect(ctx, 0, -width / 2, len, width, width / 2); ctx.fill(); ctx.stroke(); ctx.restore();
}
