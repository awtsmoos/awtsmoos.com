/* B"H
Timeline selection: one click, many clips, clear intent.
Legacy selection shape and new helper names remain compatible.
*/
export function createTimelineSelection(input = {}) {
  return { clipIds:input.clipIds || input.selection || [], trackIds:input.trackIds || [], primaryClipId:input.primaryClipId || null };
}
export function selectTimelineClip(selectionOrTimeline, clipId, additive = false) {
  const selection = selectionOrTimeline.selection && Array.isArray(selectionOrTimeline.tracks) ? selectionOrTimeline.selection : selectionOrTimeline;
  if (Array.isArray(selection)) return additive ? [...new Set([...selection, clipId])] : [clipId];
  selection.clipIds = additive ? [...new Set([...(selection.clipIds || []), clipId])] : [clipId];
  selection.primaryClipId = clipId;
  return selection;
}
export function clearTimelineSelection(selectionOrTimeline) {
  const selection = selectionOrTimeline.selection && Array.isArray(selectionOrTimeline.tracks) ? selectionOrTimeline.selection : selectionOrTimeline;
  if (Array.isArray(selection)) { selection.length = 0; return selection; }
  selection.clipIds = [];
  selection.trackIds = [];
  selection.primaryClipId = null;
  return selection;
}
