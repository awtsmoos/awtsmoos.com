/* B"H
Scene renderer: grid, sources, overlays, crop handles, and transform sparks.
The stage is night; each selected vessel receives a truthful outline.
*/
import { renderSource } from './sourceRenderers.js';
import { drawSourceOverlay } from './sourceOverlay.js';

export function renderScene(ctx, state, options = {}) {
  drawBackground(ctx, state); drawGrid(ctx, state);
  state.sources.forEach(source => renderSource(ctx, source));
  if (options.overlay !== false) state.sources.forEach((source, index) => drawSourceOverlay(ctx, source, state.selectedId === source.id, index, { tool:state.stageTool || 'transform' }));
}
function drawBackground(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, state.width, state.height);
  g.addColorStop(0, '#0a1020'); g.addColorStop(1, '#111827'); ctx.fillStyle = g; ctx.fillRect(0, 0, state.width, state.height);
}
function drawGrid(ctx, state) {
  ctx.strokeStyle = '#22304b99'; ctx.lineWidth = 1;
  for (let x = 0; x < state.width; x += 80) line(ctx, x, 0, x, state.height);
  for (let y = 0; y < state.height; y += 80) line(ctx, 0, y, state.width, y);
}
function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
