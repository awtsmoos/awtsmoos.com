/* B"H
Timeline zoom: reveal detail without changing the sequence itself.
*/
export function setTimelineZoom(timeline, zoom) { timeline.zoom = Math.max(0.1, Math.min(12, Number(zoom || 1))); return timeline.zoom; }
export function secondsToPixels(seconds, zoom = 1) { return Math.round(seconds * 80 * zoom); }
