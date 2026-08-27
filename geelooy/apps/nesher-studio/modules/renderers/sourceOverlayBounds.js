/* B"H
 * Bounds overlay: every selected source receives a clear garment of handles.
 */
export function drawSourceBounds(ctx, source, selected, index) {
  ctx.strokeStyle = selected ? '#83ffe7' : '#7c5cffaa'; ctx.lineWidth = selected ? 5 : 2;
  ctx.strokeRect(source.x, source.y, source.w, source.h); drawLabel(ctx, source, selected, index);
  if (selected) drawTransformHandles(ctx, source);
}

function drawLabel(ctx, source, selected, index) {
  const label = `${index + 1} ${source.name}`.slice(0, 46), y = Math.max(0, source.y - 30);
  ctx.fillStyle = selected ? '#83ffe7' : '#0a1020dd'; ctx.fillRect(source.x, y, Math.max(144, label.length * 8), 26);
  ctx.fillStyle = selected ? '#07101a' : '#dbe7ff'; ctx.font = '14px sans-serif'; ctx.fillText(label, source.x + 8, Math.max(18, source.y - 11));
}
function drawTransformHandles(ctx, s) {
  ctx.fillStyle = '#83ffe7'; [[s.x,s.y],[s.x+s.w,s.y],[s.x,s.y+s.h],[s.x+s.w,s.y+s.h]].forEach(([x,y]) => ctx.fillRect(x - 6, y - 6, 12, 12));
  ctx.fillStyle = '#07101a'; ctx.fillRect(s.x + s.w - 20, s.y + s.h - 20, 20, 20);
  ctx.fillStyle = '#83ffe7'; ctx.font = '12px monospace'; ctx.fillText('↘', s.x + s.w - 17, s.y + s.h - 6);
}
