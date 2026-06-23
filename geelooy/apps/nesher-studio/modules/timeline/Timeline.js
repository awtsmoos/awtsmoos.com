/* B"H
The timeline is a field where clips move, split, ripple, and remember.
This pure model powers NLE behavior before any UI drag pretends to be complete.
*/
import { createTimelineTrack, addTrackClip, removeTrackClip, findTrackClip, sortTrack } from './TimelineTrack.js';
import { createTimelineHistory, pushHistory, undoTimeline, redoTimeline } from './TimelineHistory.js';
import { createTimelineSelection, selectTimelineClip } from './TimelineSelection.js';
export function createTimeline(input = {}) {
  const tracks = input.tracks?.length ? input.tracks.map(createTimelineTrack) : [createTimelineTrack({ id:'v1', trackKind:'video', name:'V1' }), createTimelineTrack({ id:'a1', trackKind:'audio', name:'A1' })];
  return { id:input.id || id('timeline'), kind:'Timeline', fps:input.fps || 30, tracks, markers:input.markers || [], history:createTimelineHistory(input.history), selection:createTimelineSelection(input.selection), nestedSequences:input.nestedSequences || [], multicam:input.multicam || { angles:[], activeAngleId:null } };
}
export function addClip(timeline, clip, trackId = clip.trackId || 'v1') { commit(timeline, 'add clip'); const track = getTrack(timeline, trackId); const model = addTrackClip(track, clip); selectTimelineClip(timeline.selection, model.id); return model; }
export function moveClip(timeline, clipId, start, trackId) { commit(timeline, 'move clip'); const found = findClip(timeline, clipId); if (!found) return null; const clip = removeTrackClip(found.track, clipId); clip.start = Math.max(0, start); addTrackClip(getTrack(timeline, trackId || found.track.id), clip); return clip; }
export function trimClip(timeline, clipId, patch = {}) { commit(timeline, 'trim clip'); const found = findClip(timeline, clipId); if (!found) return null; Object.assign(found.clip, patch); found.clip.duration = Math.max(0.001, found.clip.duration); sortTrack(found.track); return found.clip; }
export function razorClip(timeline, clipId, time) { commit(timeline, 'razor clip'); const found = findClip(timeline, clipId); if (!found) return null; const { clip, track } = found; if (time <= clip.start || time >= clip.start + clip.duration) return null; const leftDuration = time - clip.start; const rightDuration = clip.duration - leftDuration; clip.duration = leftDuration; clip.outPoint = clip.inPoint + leftDuration; return addTrackClip(track, { ...clip, id:id('clip'), start:time, duration:rightDuration, inPoint:clip.outPoint, outPoint:clip.outPoint + rightDuration }); }
export function rippleDelete(timeline, clipId) { commit(timeline, 'ripple delete'); const found = findClip(timeline, clipId); if (!found) return null; const removed = removeTrackClip(found.track, clipId); found.track.clips.filter(c => c.start > removed.start).forEach(c => c.start = Math.max(0, c.start - removed.duration)); return removed; }
export function commit(timeline, label) { pushHistory(timeline.history, timeline, label); return timeline; }
export { undoTimeline, redoTimeline };
export function getTrack(timeline, trackId) { return timeline.tracks.find(t => t.id === trackId) || timeline.tracks[0]; }
export function findClip(timeline, clipId) { for (const track of timeline.tracks) { const clip = findTrackClip(track, clipId); if (clip) return { track, clip }; } return null; }
function id(prefix) { return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }
