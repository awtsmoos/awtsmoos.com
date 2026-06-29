/* B"H
Audio timestamp policy: audio frames are normalized into the same river as video.
*/
export function normalizeAudioTimestamp(timestamp = 0, offsetUs = 0) { return Math.max(0, Math.round(Number(timestamp || 0) + Number(offsetUs || 0))); }
export function audioDurationUs(frame) { return Math.max(0, Math.round(Number(frame?.duration || 0))); }
