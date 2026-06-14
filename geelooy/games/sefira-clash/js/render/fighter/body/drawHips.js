/**
 * B"H
 * Smaller readable pelvis renderer.
 *
 * Chapter 112: the pelvis serves the silhouette instead of swallowing it. The
 * Awtsmoos balances the lower body so fighters stop looking like triangles.
 */
function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

export function drawHips(ctx, f, color, language = {}) {
  const hip = f.bones?.spine?.root || { x: f.x, y: f.y - 56 };
  const lean = clamp(language.lean || 0, -0.28, 0.28);
  ctx.save();
  ctx.translate(hip.x, hip.y + 5);
  ctx.rotate(lean * 0.25);
  ctx.fillStyle = 'rgba(6,7,12,.86)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = 'rgba(255,255,255,.5)';
  ctx.beginPath();
  ctx.moveTo(-11, -1);
  ctx.quadraticCurveTo(0, 3, 11, -1);
  ctx.stroke();
  ctx.restore();
}
