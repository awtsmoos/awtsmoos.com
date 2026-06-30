/* B"H
Clip summary: the inspector speaks like an editor, not a demo counter.
*/
import { selectedClip } from './timeline.js';
export function describeClip(clip) {
  if (!clip) return 'No timeline clip selected.';
  const end = clip.start + clip.duration, flags = [clip.disabled ? 'disabled' : 'enabled', clip.muted ? 'muted' : 'audible'];
  const fades = `fade ${fmt(clip.fadeIn || 0)} in / ${fmt(clip.fadeOut || 0)} out`;
  return `${clip.name}: ${fmt(clip.start)}-${fmt(end)}s (${fmt(clip.duration)}s) on ${clip.trackId}; ${flags.join(', ')}; ${fades}`;
}
export function timelineInspectorSummary(timeline) {
  const markers = timeline.markers?.length || 0;
  return `${describeClip(selectedClip(timeline))}; markers ${markers}; history ${timeline.history?.length || 0}`;
}
function fmt(value) { return Number(value || 0).toFixed(1); }
