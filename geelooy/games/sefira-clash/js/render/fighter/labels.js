/**
 * B"H
 * Fighter labels.
 *
 * Chapter 25: names and damage float above the vessel like sparks of witness.
 * They do not decide the fight; they let the eye read the brawl while the
 * Awtsmoos renews every percentage and stock from nothing.
 */
export function drawLabels(ctx, f) {
  const head = f.bones.head?.tip || { x: f.x, y: f.y - 170 };
  drawOutlinedText(ctx, `${f.human ? 'YOU' : f.name} ${Math.round(f.damage)}% S${f.stocks}`, f.x, head.y - 34, 12, '#fff7c9');
  if (f.combo?.count > 2) drawOutlinedText(ctx, `${f.combo.count}x`, f.x + 42, head.y - 54, 16, '#fff4a8');
}

export function drawOutlinedText(ctx, text, x, y, size, fill) {
  ctx.font = `900 ${size}px system-ui`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 5;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}
