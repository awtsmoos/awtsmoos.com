/* B"H
Scene renderer: the grid is night, the sources are constellations,
and the selected vessel receives handles of turquoise fire.
*/
import { renderSource } from './sourceRenderers.js';
export function renderScene(ctx, state, options = {}) { drawBackground(ctx, state); drawGrid(ctx, state); state.sources.forEach(source => renderSource(ctx, source)); if (options.overlay !== false) state.sources.forEach((source, index) => drawOverlay(ctx, source, state.selectedId === source.id, index)); }
function drawBackground(ctx, state) { const g = ctx.createLinearGradient(0, 0, state.width, state.height); g.addColorStop(0, '#0a1020'); g.addColorStop(1, '#111827'); ctx.fillStyle = g; ctx.fillRect(0, 0, state.width, state.height); }
function drawGrid(ctx, state) { ctx.strokeStyle = '#22304b99'; ctx.lineWidth = 1; for (let x = 0; x < state.width; x += 80) line(ctx, x, 0, x, state.height); for (let y = 0; y < state.height; y += 80) line(ctx, 0, y, state.width, y); }
function drawOverlay(ctx, source, selected, index) {
  if (!source.visible) return; ctx.save(); ctx.strokeStyle = selected ? '#83ffe7' : '#7c5cffaa'; ctx.lineWidth = selected ? 5 : 2; ctx.strokeRect(source.x, source.y, source.w, source.h);
  const label = `${index + 1} ${source.name}`.slice(0, 34); ctx.fillStyle = selected ? '#83ffe7' : '#0a1020dd'; ctx.fillRect(source.x, Math.max(0, source.y - 30), Math.max(132, label.length * 8), 26); ctx.fillStyle = selected ? '#07101a' : '#dbe7ff'; ctx.font = '14px sans-serif'; ctx.fillText(label, source.x + 8, Math.max(18, source.y - 11)); if (selected) drawHandles(ctx, source); ctx.restore();
}
function drawHandles(ctx, s) { ctx.fillStyle = '#83ffe7'; [[s.x,s.y],[s.x+s.w,s.y],[s.x,s.y+s.h],[s.x+s.w,s.y+s.h]].forEach(([x,y]) => ctx.fillRect(x - 5, y - 5, 10, 10)); ctx.fillStyle = '#07101a'; ctx.fillRect(s.x + s.w - 16, s.y + s.h - 16, 16, 16); }
function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
