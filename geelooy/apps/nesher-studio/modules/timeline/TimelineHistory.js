/* B"H
History stores bounded plain snapshots. The snapshot must not swallow its own
history forever; memory is a vessel, not an idol.
*/
export function createTimelineHistory(input = {}) { return { kind:'TimelineHistory', past:input.past || [], future:input.future || [], limit:input.limit || 100 }; }
export function snapshotTimeline(timeline, label = 'change') { return { label, at:Date.now(), timeline:plainTimeline(timeline) }; }
export function pushHistory(history, timeline, label) { history.past.push(snapshotTimeline(timeline, label)); if (history.past.length > history.limit) history.past.shift(); history.future.length = 0; return history; }
export function undoTimeline(history, timeline) { const snap = history.past.pop(); if (!snap) return timeline; history.future.push(snapshotTimeline(timeline, 'redo-point')); return Object.assign(timeline, snap.timeline, { history }); }
export function redoTimeline(history, timeline) { const snap = history.future.pop(); if (!snap) return timeline; history.past.push(snapshotTimeline(timeline, 'undo-point')); return Object.assign(timeline, snap.timeline, { history }); }
function plainTimeline(timeline) {
  return JSON.parse(JSON.stringify({
    id:timeline.id, kind:timeline.kind, fps:timeline.fps, tracks:timeline.tracks,
    markers:timeline.markers, selection:timeline.selection, nestedSequences:timeline.nestedSequences,
    multicam:timeline.multicam
  }));
}
