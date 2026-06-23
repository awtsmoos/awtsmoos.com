/* B"H */
export function createSnapEngine(input = {}) { return { kind:'SnapEngine', enabled:input.enabled ?? true, threshold:input.threshold ?? .1 }; }
export function snapTime(time, points = [], threshold = .1) { const hit = points.find(p => Math.abs(p - time) <= threshold); return hit ?? time; }
export function collectSnapPoints(timeline) { return timeline.tracks.flatMap(t => t.clips.flatMap(c => [c.start, c.start + c.duration])).concat(timeline.markers.map(m => m.time)); }
