/* B"H
Advanced timeline commands: duplication, snapping, fades, mute, disable, markers.
*/
import { addClip, moveClip, selectedClip, trimClip } from './timeline.js';
export function duplicateSelectedClip(timeline) {
  const clip = selectedClip(timeline); if (!clip) return null;
  const copy = addClip(timeline, { ...clip, id:'', name:`${clip.name} copy`, start:clip.start + clip.duration, inPoint:clip.inPoint }, { silent:false });
  timeline.selectedClipId = copy.id; return copy;
}
export function snapSelectedClip(timeline, direction = 'next') {
  const clip = selectedClip(timeline); if (!clip) return null;
  const boundary = nearestBoundary(timeline, clip, direction); if (boundary == null) return clip;
  const moved = moveClip(timeline, clip.id, boundary, clip.trackId); timeline.selectedClipId = moved.id; return moved;
}
export function setSelectedClipFades(timeline, fadeIn = .5, fadeOut = .5) {
  const clip = selectedClip(timeline); if (!clip) return null;
  return trimClip(timeline, clip.id, { fadeIn:limit(fadeIn, clip.duration), fadeOut:limit(fadeOut, clip.duration) });
}
export function toggleSelectedClipMute(timeline) { return toggleFlag(timeline, 'muted'); }
export function toggleSelectedClipDisabled(timeline) { return toggleFlag(timeline, 'disabled'); }
export function addTimelineMarker(timeline, input = {}) {
  const clip = selectedClip(timeline), at = Number.isFinite(+input.at) ? +input.at : clip?.start || 0;
  timeline.markers ||= []; const marker = { id:input.id || `marker-${Date.now()}`, at, label:input.label || 'Marker' };
  timeline.markers.push(marker); timeline.markers.sort((a, b) => a.at - b.at); return marker;
}
function nearestBoundary(timeline, clip, direction) {
  const all = timeline.tracks.flatMap(t => t.clips).filter(c => c.id !== clip.id).flatMap(c => [c.start, c.start + c.duration]).sort((a, b) => a - b);
  return direction === 'previous' ? all.filter(v => v <= clip.start).pop() : all.find(v => v >= clip.start + clip.duration);
}
function toggleFlag(timeline, key) { const clip = selectedClip(timeline); return clip ? trimClip(timeline, clip.id, { [key]:!clip[key] }) : null; }
function limit(value, duration) { return Math.max(0, Math.min(Number(value || 0), Math.max(0, duration / 2))); }
