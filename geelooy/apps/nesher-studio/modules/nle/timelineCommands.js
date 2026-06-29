/* B"H
Timeline commands: edit verbs become safe small doors over the timeline model.
The Awtsmoos joins before and after, yet the clip still needs a precise start time.
*/
import { moveClip, rippleDeleteClip, selectedClip, splitClip, trimClip } from './timeline.js';

export function splitSelectedClip(timeline, ratio = .5) {
  const clip = selectedClip(timeline); if (!clip) return null;
  return splitClip(timeline, clip.id, clip.start + clip.duration * ratio);
}
export function trimSelectedClipBy(timeline, seconds = -1) {
  const clip = selectedClip(timeline); if (!clip) return null;
  return trimClip(timeline, clip.id, { duration:Math.max(.25, clip.duration + seconds) });
}
export function nudgeSelectedClip(timeline, seconds = 1) {
  const clip = selectedClip(timeline); if (!clip) return null;
  const moved = moveClip(timeline, clip.id, clip.start + seconds, clip.trackId);
  timeline.selectedClipId = moved?.id || timeline.selectedClipId; return moved;
}
export function moveSelectedClipToNextTrack(timeline) {
  const clip = selectedClip(timeline); if (!clip) return null;
  const tracks = timeline.tracks || [], index = tracks.findIndex(t => t.id === clip.trackId);
  const target = tracks[(index + 1) % tracks.length] || tracks[0];
  const moved = moveClip(timeline, clip.id, clip.start, target.id);
  timeline.selectedClipId = moved?.id || timeline.selectedClipId; return moved;
}
export function rippleDeleteSelectedClip(timeline) {
  const clip = selectedClip(timeline); return clip ? rippleDeleteClip(timeline, clip.id) : null;
}
export function timelineCommandSummary(timeline) {
  const clip = selectedClip(timeline);
  return clip ? `${clip.name}: ${clip.start.toFixed(1)}s for ${clip.duration.toFixed(1)}s on ${clip.trackId}` : 'No timeline clip selected.';
}
