/* B"H
Track model: video and audio lanes carry clips without knowing the UI.
*/
export function createTrack(input = {}) { return { id:input.id || `track-${Date.now()}`, name:input.name || 'Track', kind:input.kind || 'video', clips:input.clips || [], muted:!!input.muted, locked:!!input.locked }; }
export function addTrackClip(track, clip) { track.clips.push({ ...clip, trackId:track.id }); return track.clips.at(-1); }
