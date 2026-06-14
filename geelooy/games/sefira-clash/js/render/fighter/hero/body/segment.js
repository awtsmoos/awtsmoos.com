/**
 * B"H
 * Hero part segment.
 *
 * Chapter 180: generic capsules become armored limbs with shadow and highlight.
 */
export function heroSegment(ctx, a, b, width, color, shadow = false) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (!Number.isFinite(len) || len < 2) return;
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(Math.atan2(dy, dx));
  ctx.fillStyle = shadow ? 'rgba(2,3,7,.98)' : color;
  ctx.strokeStyle = 'rgba(0,0,0,.88)';
  ctx.lineWidth = 2.5;
  roundRect(ctx, 0, -width / 2, len, width, width / 2);
  ctx.fill();
  ctx.stroke();
  if (!shadow) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    roundRect(ctx, len * 0.14, -width * 0.32, len * 0.35, width * 0.17, width * 0.08);
    ctx.fill();
  }
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
