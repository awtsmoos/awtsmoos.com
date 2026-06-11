/**
 * B"H — Professional black/gold panels echo the mockup without becoming a
 * static poster. They frame live data with thin gold lines and soft ink.
 */
export function panel(ctx, x, y, w, h, title) {
  ctx.fillStyle = 'rgba(0,0,0,.72)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(240,200,85,.75)';
  ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
  ctx.fillStyle = '#f4d56c';
  ctx.font = 'bold 12px system-ui';
  ctx.fillText(title, x + 10, y + 18);
}

export function bar(ctx, x, y, w, value, color) {
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(x, y, w, 5);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, value)), 5);
}
