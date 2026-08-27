/* B"H
 * Timeline view model: a real ruler and playhead without DOM entanglement.
 */
import { pctAt, pctDuration, rulerTicks, visibleDuration } from './timelineScale.js';

export function buildTimelineView(timeline) {
  const duration = visibleDuration(timeline), zoom = Number(timeline?.zoom || 1);
  return { duration, zoom, playheadPct:pctAt(timeline?.playhead || 0, duration), ticks:rulerTicks(timeline), markers:markers(timeline, duration), tracks:tracks(timeline, duration), selectedClipId:timeline?.selectedClipId };
}
function tracks(timeline, duration) {
  return (timeline?.tracks || []).map(track => ({ id:track.id, name:track.name, kind:track.kind, count:track.clips.length, clips:track.clips.map(c => clip(c, timeline, duration)) }));
}
function clip(c, timeline, duration) {
  return { ...c, left:pctAt(c.start, duration), width:pctDuration(c.duration, duration), active:c.id === timeline.selectedClipId, end:c.start + c.duration };
}
function markers(timeline, duration) {
  return (timeline?.markers || []).map(m => ({ ...m, left:pctAt(m.at, duration) }));
}
