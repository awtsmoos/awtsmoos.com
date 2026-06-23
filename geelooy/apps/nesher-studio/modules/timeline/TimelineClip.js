/* B"H
TimelineClip is time made editable: start, in, out, duration, asset, selection.
Every cut is a small revelation, never a vague scaffold.
*/
export function createTimelineClip(input = {}) {
  const duration = num(input.duration, Math.max(0, num(input.outPoint, 1) - num(input.inPoint, 0)) || 1);
  return { id:input.id || id('clip'), kind:'TimelineClip', assetId:input.assetId || null, name:input.name || 'Clip', start:num(input.start, 0), duration, inPoint:num(input.inPoint, 0), outPoint:num(input.outPoint, duration), trackId:input.trackId || null, selected:!!input.selected, effects:input.effects || [], keyframes:input.keyframes || [] };
}
export function cloneClip(clip, patch = {}) { return createTimelineClip({ ...clip, ...patch, id:patch.id ?? clip.id }); }
function num(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function id(prefix) { return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }
