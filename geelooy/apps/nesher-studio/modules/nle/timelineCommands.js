/* B"H
 * Timeline commands: edit verbs and transport verbs over the small model.
 */
import { addTimelineMarker, duplicateSelectedClip, setSelectedClipFades, snapSelectedClip, toggleSelectedClipDisabled, toggleSelectedClipMute } from './advancedTimelineCommands.js';
import { timelineInspectorSummary } from './clipSummary.js';
import { setTimelineZoom } from './timelineScale.js';
import { moveClip, rippleDeleteClip, selectedClip, setPlayhead, splitClip, trimClip } from './timeline.js';
export { addTimelineMarker, duplicateSelectedClip, setSelectedClipFades, snapSelectedClip, toggleSelectedClipDisabled, toggleSelectedClipMute };
export function splitSelectedClip(timeline, ratio = .5) { const clip = selectedClip(timeline); return clip ? splitClip(timeline, clip.id, clip.start + clip.duration * ratio) : null; }
export function trimSelectedClipBy(timeline, seconds = -1) { const clip = selectedClip(timeline); return clip ? trimClip(timeline, clip.id, { duration:Math.max(.25, clip.duration + seconds) }) : null; }
export function nudgeSelectedClip(timeline, seconds = 1) { const clip = selectedClip(timeline); if (!clip) return null; const moved = moveClip(timeline, clip.id, clip.start + seconds, clip.trackId); timeline.selectedClipId = moved?.id || timeline.selectedClipId; return moved; }
export function moveSelectedClipToNextTrack(timeline) { const clip = selectedClip(timeline); if (!clip) return null; const tracks = timeline.tracks || [], index = tracks.findIndex(t => t.id === clip.trackId), target = tracks[(index + 1) % tracks.length] || tracks[0]; const moved = moveClip(timeline, clip.id, clip.start, target.id); timeline.selectedClipId = moved?.id || timeline.selectedClipId; return moved; }
export function rippleDeleteSelectedClip(timeline) { const clip = selectedClip(timeline); return clip ? rippleDeleteClip(timeline, clip.id) : null; }
export function movePlayhead(timeline, delta) { return setPlayhead(timeline, Number(timeline.playhead || 0) + delta); }
export function jumpPlayhead(timeline, edge) { return setPlayhead(timeline, edge === 'end' ? timeline.duration : 0); }
export function zoomTimeline(timeline, delta) { return setTimelineZoom(timeline, delta); }
export function timelineCommandSummary(timeline) { return timelineInspectorSummary(timeline); }
