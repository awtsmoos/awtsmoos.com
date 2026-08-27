/* B"H
Timeline snap: clips find nearby anchors instead of drifting alone.
*/
export function snapTime(time, anchors = [], threshold = 0.08) { const hit = anchors.find(anchor => Math.abs(anchor - time) <= threshold); return Number.isFinite(hit) ? hit : time; }
export function clipAnchors(tracks = []) { return tracks.flatMap(t => t.clips.flatMap(c => [c.start, c.start + c.duration])); }
