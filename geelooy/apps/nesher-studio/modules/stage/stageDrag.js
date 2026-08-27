/* B"H
Stage drag: transform and crop share one canvas, but each obeys its own covenant.
The crop edge moves without stealing the media; the transform scales without betrayal.
*/
import { selectedSource } from '../graph/sceneGraph.js';
import { cropBox, cropFromBox, cropHandleAt, insideSource, resizeHandleAt, resizedSourceBox, stagePoint } from './stageGeometry.js';

export function beginStageDrag(state, event, canvas) {
  const p = stagePoint(event, canvas), hit = [...state.sources].reverse().find(source => insideSource(source, p));
  if (!hit) return clearSelection(state);
  if (hit.locked) return null;
  state.selectedId = hit.id;
  const tool = state.stageTool === 'crop' ? 'crop' : 'transform';
  state.drag = tool === 'crop' ? cropDrag(hit, p) : transformDrag(hit, p);
  canvas.setPointerCapture?.(event.pointerId);
  return hit;
}
export function moveStageDrag(state, event, canvas) {
  if (!state.drag) return null;
  const source = state.sources.find(x => x.id === state.drag.id), p = stagePoint(event, canvas);
  if (!source) return null;
  if (state.drag.tool === 'crop') dragCrop(source, state.drag, p);
  else dragTransform(source, state.drag, p, event.shiftKey);
  return source;
}
export function endStageDrag(state) { state.drag = null; }
export function keyMoveSelected(state, event) {
  if (!state.selectedId || ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return false;
  const step = event.shiftKey ? 10 : 1, map = { ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step] };
  if (!map[event.key]) return false; const s = selectedSource(state); if (!s || s.locked) return false;
  event.preventDefault(); s.x += map[event.key][0]; s.y += map[event.key][1]; return true;
}
function clearSelection(state) { state.selectedId = null; state.drag = null; return null; }
function transformDrag(source, p) { return { id:source.id, tool:'transform', mode:resizeHandleAt(source, p) || 'move', dx:p.x - source.x, dy:p.y - source.y }; }
function cropDrag(source, p) { return { id:source.id, tool:'crop', handle:cropHandleAt(source, p) || 'move', start:p, box:cropBox(source) }; }
function dragTransform(source, drag, p, freeAspect) {
  if (drag.mode === 'se') Object.assign(source, resizedSourceBox(source, p, source.lockAspect !== false && !freeAspect));
  else { source.x = p.x - drag.dx; source.y = p.y - drag.dy; }
}
function dragCrop(source, drag, p) {
  const b = { ...drag.box }, dx = p.x - drag.start.x, dy = p.y - drag.start.y;
  if (drag.handle === 'move') return moveCrop(source, b, dx, dy);
  if (drag.handle.includes('e')) b.w += dx;
  if (drag.handle.includes('s')) b.h += dy;
  if (drag.handle.includes('w')) { b.x += dx; b.w -= dx; }
  if (drag.handle.includes('n')) { b.y += dy; b.h -= dy; }
  source.crop = cropFromBox(source, b);
}
function moveCrop(source, box, dx, dy) { box.x += dx; box.y += dy; source.crop = cropFromBox(source, box); }
