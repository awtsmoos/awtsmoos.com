/* B"H
Source overlay: selected layers receive handles, and crop becomes visible fire.
*/
export function drawSourceOverlay(ctx, source, selected, index, options = {}) {
  if (!source.visible) return; ctx.save(); drawBounds(ctx, source, selected, index); if (selected) drawHandles(ctx, source); if (selected && options.tool === 'crop') drawCrop(ctx, source); ctx.restore();
}
function drawBounds(ctx, source, selected, index) {
  ctx.strokeStyle = selected ? '#83ffe7' : '#7c5cffaa'; ctx.lineWidth = selected ? 5 : 2; ctx.strokeRect(source.x, source.y, source.w, source.h);
  const label = `${index + 1} ${source.name}`.slice(0, 42); ctx.fillStyle = selected ? '#83ffe7' : '#0a1020dd'; ctx.fillRect(source.x, Math.max(0, source.y - 30), Math.max(132, label.length * 8), 26);
  ctx.fillStyle = selected ? '#07101a' : '#dbe7ff'; ctx.font = '14px sans-serif'; ctx.fillText(label, source.x + 8, Math.max(18, source.y - 11));
}
function drawHandles(ctx, s) {
  ctx.fillStyle = '#83ffe7'; [[s.x,s.y],[s.x+s.w,s.y],[s.x,s.y+s.h],[s.x+s.w,s.y+s.h]].forEach(([x,y]) => ctx.fillRect(x - 5, y - 5, 10, 10));
  ctx.fillStyle = '#07101a'; ctx.fillRect(s.x + s.w - 18, s.y + s.h - 18, 18, 18);
}
function drawCrop(ctx, s) {
  const c = s.crop || {}, x = s.x + s.w * (c.left || 0) / 100, y = s.y + s.h * (c.top || 0) / 100;
  const w = s.w * (100 - (c.left || 0) - (c.right || 0)) / 100, h = s.h * (100 - (c.top || 0) - (c.bottom || 0)) / 100;
  ctx.fillStyle = '#02081799'; ctx.fillRect(s.x, s.y, s.w, y - s.y); ctx.fillRect(s.x, y + h, s.w, s.y + s.h - y - h); ctx.fillRect(s.x, y, x - s.x, h); ctx.fillRect(x + w, y, s.x + s.w - x - w, h);
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeRect(x, y, w, h); ctx.setLineDash([]); cropHandles(ctx, x, y, w, h);
}
function cropHandles(ctx, x, y, w, h) { ctx.fillStyle = '#ffd166'; [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].forEach(([a,b]) => ctx.fillRect(a - 6, b - 6, 12, 12)); }
