/**
 * B"H
 * Hero rim highlights.
 *
 * Chapter 204: a thin glint around the vessel makes the dark suit readable
 * against the arena parchment.
 */
export function drawRimHighlights(ctx, p, mat) {
  const s = p.scale || 1;
  ctx.save();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = mat.glint;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(p.leftShoulder.x, p.leftShoulder.y + 6 * s);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y - 8 * s, p.rightShoulder.x, p.rightShoulder.y + 6 * s);
  ctx.stroke();
  ctx.restore();
}
