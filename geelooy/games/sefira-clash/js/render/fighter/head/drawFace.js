/**
 * B"H
 * Refined face renderer.
 *
 * Chapter 104: the head is no longer a flat coin floating above sticks. The
 * Awtsmoos gives it brow, jaw, cheek-light, and readable direction while staying
 * fast enough for the mobile arena.
 */
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

export function drawFace(ctx, f, x, y, color, language = {}) {
  const size = clamp(language.headSize || 18, 13, 24);
  const face = Math.sign(f.face || 1) || 1;
  const panic = clamp(language.panic || 0, 0, 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(clamp(language.lean || 0, -0.28, 0.28) * 0.18);
  ctx.lineWidth = 3;
  ctx.fillStyle = '#080609';
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.86, size * 1.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.52, size * 0.36);
  ctx.quadraticCurveTo(face * size * 0.12, size * (0.78 + panic * 0.08), size * 0.54, size * 0.34);
  ctx.stroke();
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-size * 0.22, -size * 0.24, size * 0.18, size * 0.11, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
