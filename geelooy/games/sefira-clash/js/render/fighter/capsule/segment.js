/**
 * B"H
 * Capsule segment painter.
 *
 * Chapter 121: limbs become vessels, not raw lines. Each arm and leg receives
 * width, shadow, and rounded joints so motion reads as body instead of wire.
 */
function angle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function len(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function capsuleSegment(ctx, a, b, width, color, options = {}) {
  const length = len(a, b);
  if (!Number.isFinite(length) || length < 2) return;
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(angle(a, b));
  ctx.fillStyle = options.shadow ? 'rgba(2,3,6,.88)' : color;
  ctx.strokeStyle = options.stroke || 'rgba(0,0,0,.75)';
  ctx.lineWidth = options.lineWidth || 2;
  roundRect(ctx, 0, -width / 2, length, width, width / 2);
  ctx.fill();
  ctx.stroke();
  if (!options.shadow) {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    roundRect(ctx, length * 0.12, -width * 0.34, length * 0.42, width * 0.18, width * 0.09);
    ctx.fill();
  }
  ctx.restore();
}

export function joint(ctx, p, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
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
}
