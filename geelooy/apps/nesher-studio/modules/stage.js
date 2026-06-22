/* B"H */
import { dom, ctx } from './dom.js';
import { reorderSource } from './layers.js';
import { renderScene } from './renderers/sceneRenderer.js';
export function resizeStage(state) { dom.stage.width = state.width; dom.stage.height = state.height; drawStage(state); }
export function drawStage(state, options = {}) { renderScene(ctx, state, options); }
export function refreshSources(state) { dom.sourceList.innerHTML = ''; state.sources.forEach((source, index) => dom.sourceList.append(sourceRow(state, source, index))); }
export function bindDragging(state) {
  dom.stage.addEventListener('pointerdown', event => { const p = point(event); const hit = [...state.sources].reverse().find(source => inside(source, p)); if (!hit || hit.locked) return; state.selectedId = hit.id; state.drag = { id:hit.id, dx:p.x - hit.x, dy:p.y - hit.y, mode:edgeMode(hit, p) }; dom.stage.setPointerCapture?.(event.pointerId); drawStage(state); refreshSources(state); });
  dom.stage.addEventListener('pointermove', event => movePointer(state, point(event)));
  window.addEventListener('pointerup', () => { state.drag = null; }); window.addEventListener('keydown', event => keyMove(state, event));
}
function sourceRow(state, source, index) {
  const li = document.createElement('li'); li.draggable = true; li.dataset.id = source.id; li.className = source.id === state.selectedId ? 'selected-source' : '';
  li.innerHTML = `<strong>${index + 1}. ${escapeHtml(source.name)}</strong><span>${Math.round(source.x)},${Math.round(source.y)} · ${Math.round(source.w)}×${Math.round(source.h)} · ${source.type}</span>`;
  li.onclick = () => { state.selectedId = source.id; drawStage(state); refreshSources(state); };
  li.ondragstart = event => event.dataTransfer.setData('text/source-id', source.id); li.ondragover = event => event.preventDefault();
  li.ondrop = event => { event.preventDefault(); if (reorderSource(state, event.dataTransfer.getData('text/source-id'), source.id)) { refreshSources(state); drawStage(state); } };
  return li;
}
function movePointer(state, p) { if (!state.drag) return; const source = state.sources.find(x => x.id === state.drag.id); if (!source) return; if (state.drag.mode === 'resize') { source.w = Math.max(40, p.x - source.x); source.h = Math.max(40, p.y - source.y); } else { source.x = p.x - state.drag.dx; source.y = p.y - state.drag.dy; } drawStage(state); refreshSources(state); }
function keyMove(state, event) { if (!state.selectedId || ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return; const step = event.shiftKey ? 10 : 1; const map = { ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step] }; if (!map[event.key]) return; event.preventDefault(); const source = state.sources.find(x => x.id === state.selectedId); if (!source || source.locked) return; source.x += map[event.key][0]; source.y += map[event.key][1]; drawStage(state); refreshSources(state); }
function inside(s, p) { return p.x >= s.x && p.y >= s.y && p.x <= s.x + s.w && p.y <= s.y + s.h; }
function edgeMode(s, p) { return p.x > s.x + s.w - 24 && p.y > s.y + s.h - 24 ? 'resize' : 'move'; }
function point(e) { const r = dom.stage.getBoundingClientRect(); return { x:(e.clientX - r.left) * dom.stage.width / r.width, y:(e.clientY - r.top) * dom.stage.height / r.height }; }
function escapeHtml(text) { return String(text).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]); }
