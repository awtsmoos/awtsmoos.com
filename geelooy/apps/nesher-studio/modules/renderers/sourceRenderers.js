/* B"H */
export function renderSource(ctx, source) {
  if (!source.visible) return;
  ctx.save(); applyTransform(ctx, source); ctx.globalAlpha *= source.stopped ? .35 : source.opacity ?? 1;
  try { drawByType(ctx, source); } catch { drawMissing(ctx, source); }
  ctx.restore();
}
function applyTransform(ctx, source) {
  const cx = source.x + source.w / 2; const cy = source.y + source.h / 2;
  ctx.translate(cx, cy); ctx.rotate((source.rotation || 0) * Math.PI / 180); ctx.translate(-source.w / 2, -source.h / 2);
}
function drawByType(ctx, source) {
  if (source.type === 'browser' || source.type === 'iframe') return drawBrowserPlate(ctx, source);
  if (source.node) return ctx.drawImage(source.node, 0, 0, source.w, source.h);
  drawMissing(ctx, source);
}
function drawBrowserPlate(ctx, source) {
  ctx.fillStyle = '#070b16'; ctx.fillRect(0, 0, source.w, source.h);
  ctx.fillStyle = '#dbe7ff'; ctx.font = '24px sans-serif'; ctx.fillText(source.type === 'browser' ? 'Browser Source' : 'Iframe source', 22, 52);
  ctx.font = '16px monospace'; ctx.fillText((source.url || '').slice(0, 46), 22, 88);
  ctx.strokeStyle = '#35518f'; ctx.lineWidth = 8; ctx.strokeRect(8, 8, source.w - 16, source.h - 16);
}
function drawMissing(ctx, source) {
  ctx.fillStyle = '#221018'; ctx.fillRect(0, 0, source.w, source.h); ctx.fillStyle = '#ffdbe6'; ctx.font = '18px sans-serif'; ctx.fillText('Source unavailable', 18, 42);
}
