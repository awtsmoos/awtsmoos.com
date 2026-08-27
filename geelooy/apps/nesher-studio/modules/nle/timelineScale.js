/* B"H
 * Timeline scale: seconds become percentages, ticks, and playhead positions.
 */
export function visibleDuration(timeline) {
  const markerEnd = Math.max(0, ...(timeline?.markers || []).map(m => m.at + 1));
  return Math.max(1, timeline?.duration || 1, markerEnd);
}
export function pctAt(value, total) { return Math.max(0, Math.min(100, (Number(value || 0) / total) * 100)); }
export function pctDuration(value, total) { return Math.max(2.5, Math.min(100, (Number(value || 0) / total) * 100)); }
export function rulerTicks(timeline, maxTicks = 10) {
  const total = visibleDuration(timeline), step = niceStep(total / maxTicks), ticks = [];
  for (let t = 0; t <= total + .001; t += step) ticks.push({ time:+t.toFixed(2), pct:pctAt(t, total), label:`${Math.round(t)}s` });
  return ticks;
}
export function setTimelineZoom(timeline, delta = 0) {
  timeline.zoom = Math.max(.5, Math.min(4, Number(timeline.zoom || 1) + delta)); return timeline.zoom;
}
function niceStep(raw) { return raw <= 1 ? 1 : raw <= 2 ? 2 : raw <= 5 ? 5 : Math.ceil(raw / 5) * 5; }
