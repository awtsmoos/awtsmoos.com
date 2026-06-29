/* B"H
Timeline history: every edit can return through the gate it entered.
Old API names remain alive while the newer model helpers share the same vessel.
*/
export function createTimelineHistory(input = {}) {
  return { past:input.past || [], future:input.future || [], labels:input.labels || [] };
}
export function pushHistory(history, timeline, label = 'edit') {
  history.past.push(snapshotTimeline(timeline));
  history.labels.push(label);
  history.future.length = 0;
  return history;
}
export function pushTimelineHistory(history, timeline) { return pushHistory(history, timeline, 'edit'); }
export function undoTimeline(history, current) {
  const prev = history.past.pop();
  if (!prev) return current;
  history.future.push(snapshotTimeline(current));
  return JSON.parse(prev);
}
export function redoTimeline(history, current) {
  const next = history.future.pop();
  if (!next) return current;
  history.past.push(snapshotTimeline(current));
  return JSON.parse(next);
}
function snapshotTimeline(timeline) {
  return JSON.stringify(timeline, (key, value) => key === 'history' ? undefined : value);
}
