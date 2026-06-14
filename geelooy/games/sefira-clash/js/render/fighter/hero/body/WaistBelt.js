/**
 * B"H
 * Sculpted waist belt.
 *
 * Chapter 198: the narrow waist catches the accent light and completes the
 * action-figure silhouette.
 */
export function drawWaistBelt(ctx, p, mat) {
  const s = p.scale || 1;
  ctx.save();
  ctx.strokeStyle = mat.accent;
  ctx.lineWidth = 8 * s;
  ctx.globalAlpha = .96;
  ctx.beginPath();
  ctx.moveTo(p.leftHip.x - 12 * s, p.leftHip.y + 5 * s);
  ctx.lineTo(p.rightHip.x + 12 * s, p.rightHip.y + 5 * s);
  ctx.stroke();
  ctx.restore();
}
