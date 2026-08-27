/* B"H */
import { createTimelineClip } from './TimelineClip.js';
export function createTimelineTrack(input = {}) { return { id:input.id || id('track'), kind:'TimelineTrack', trackKind:input.trackKind || 'video', name:input.name || 'Track', clips:(input.clips || []).map(createTimelineClip), locked:!!input.locked, muted:!!input.muted, solo:!!input.solo, targeted:input.targeted ?? true }; }
export function addTrackClip(track, clip) { const model = createTimelineClip({ ...clip, trackId:track.id }); track.clips.push(model); sortTrack(track); return model; }
export function removeTrackClip(track, clipId) { const i = track.clips.findIndex(c => c.id === clipId); return i >= 0 ? track.clips.splice(i, 1)[0] : null; }
export function findTrackClip(track, clipId) { return track.clips.find(c => c.id === clipId) || null; }
export function sortTrack(track) { track.clips.sort((a, b) => a.start - b.start); return track; }
function id(prefix) { return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }
