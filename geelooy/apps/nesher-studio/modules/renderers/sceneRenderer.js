/* B"H */
import { renderSource } from './sourceRenderers.js';
export function renderScene(ctx, state, options = {}) {
  drawBackground(ctx, state); drawGrid(ctx, state); state.sources.forEach(source => renderSource(ctx, source));
  if (options.overlay !== false) state.sources.forEach((source, index) => drawOverlay(ctx, source, state.selectedId === source.id, index));
}
function drawBackground(ctx, state) { ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, state.width, state.height); }
function drawGrid(ctx, state) { ctx.strokeStyle = '#22304b'; ctx.lineWidth = 1; for (let x = 0; x < state.width; x += 80) line(ctx, x, 0, x, state.height); for (let y = 0; y < state.height; y += 80) line(ctx, 0, y, state.width, y); }
function drawOverlay(ctx, source, selected, index) {
  if (!source.visible) return; ctx.save(); ctx.strokeStyle = selected ? '#83ffe7' : '#7c5cff'; ctx.lineWidth = selected ? 5 : 2; ctx.strokeRect(source.x, source.y, source.w, source.h);
  const label = `${index + 1} ${source.name}`.slice(0, 32); ctx.fillStyle = selected ? '#83ffe7' : '#0a1020cc'; ctx.fillRect(source.x, source.y - 28, Math.max(120, label.length * 8), 26); ctx.fillStyle = selected ? '#07101a' : '#dbe7ff'; ctx.font = '14px sans-serif'; ctx.fillText(label, source.x + 8, source.y - 10); if (selected) ctx.fillRect(source.x + source.w - 14, source.y + source.h - 14, 14, 14); ctx.restore();
}
function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
