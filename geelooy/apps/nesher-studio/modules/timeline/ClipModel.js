/* B"H
Clip model: a spark of media receives time, track, and edit handles.
*/
export function createClip(input = {}) { return { id:input.id || `clip-${Date.now()}`, assetId:input.assetId || null, trackId:input.trackId || null, start:Number(input.start || 0), duration:Number(input.duration || 1), inPoint:Number(input.inPoint || 0), name:input.name || 'Clip', muted:!!input.muted, disabled:!!input.disabled, volume:input.volume ?? 1, opacity:input.opacity ?? 1, speed:input.speed ?? 1 }; }
export function clipEnd(clip) { return clip.start + clip.duration; }
