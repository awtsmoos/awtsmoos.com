/* B"H
Stage transform commands: scale is usually faithful, unless the editor explicitly frees it.
In the resize, a source remembers its first garment and returns to dignity.
*/
import { selectedSource } from '../graph/sceneGraph.js';

export function setStageTool(state, tool) { state.stageTool = tool === 'crop' ? 'crop' : 'transform'; return state.stageTool; }
export function setSelectedAspectLock(state, locked) { const s = selectedSource(state); if (!s) return null; s.lockAspect = locked !== false; return s; }
export function setSelectedSourceScale(state, percent) {
  const s = selectedSource(state); if (!s) return null;
  const scale = Math.max(5, Math.min(500, Number(percent || 100))) / 100;
  s.scalePercent = Math.round(scale * 100); s.w = Math.max(20, s.baseW * scale); s.h = Math.max(20, s.baseH * scale); centerIfOutside(state, s); return s;
}
export function fitSelectedSource(state, mode = 'fit') {
  const s = selectedSource(state); if (!s) return null;
  const ratio = mode === 'fill' ? Math.max(state.width / s.baseW, state.height / s.baseH) : Math.min(state.width / s.baseW, state.height / s.baseH);
  s.scalePercent = Math.round(ratio * 100); s.w = Math.round(s.baseW * ratio); s.h = Math.round(s.baseH * ratio); centerSelectedSource(state); return s;
}
export function centerSelectedSource(state) { const s = selectedSource(state); if (!s) return null; s.x = Math.round((state.width - s.w) / 2); s.y = Math.round((state.height - s.h) / 2); return s; }
export function resetSelectedTransform(state) {
  const s = selectedSource(state); if (!s) return null;
  Object.assign(s, { x:40, y:40, w:s.baseW, h:s.baseH, rotation:0, opacity:1, scalePercent:100, crop:{ left:0, top:0, right:0, bottom:0 } });
  return s;
}
export function transformSummary(source) {
  if (!source) return '';
  const scale = source.scalePercent || Math.round(source.w / Math.max(1, source.baseW || source.w) * 100);
  return `${scale}% scale · aspect ${source.lockAspect === false ? 'free' : 'locked'}`;
}
function centerIfOutside(state, s) { if (s.x > state.width || s.y > state.height) centerSelectedSource(state); }
