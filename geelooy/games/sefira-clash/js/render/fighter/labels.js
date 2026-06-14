/**
 * B"H
 * Cleaner fighter labels.
 *
 * Chapter 225: witness text becomes small and high. It no longer sits on the
 * helmet or screams over the body while the Awtsmoos renews every number.
 */
export function drawLabels(ctx, f) {
  const y = f.y - 196;
  const name = f.human ? 'YOU' : f.name.replace('Bot ', 'B');
  drawOutlinedText(ctx, `${name} ${Math.round(f.damage)}% S${f.stocks}`, f.x, y, 9, '#fff7c9');
  if (f.combo?.count > 2) drawOutlinedText(ctx, `${f.combo.count}x`, f.x + 34, y - 14, 12, '#fff4a8');
}

export function drawOutlinedText(ctx, text, x, y, size, fill) {
  ctx.font = `900 ${size}px system-ui`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(3, size * 0.34);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}
