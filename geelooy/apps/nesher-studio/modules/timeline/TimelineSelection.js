/* B"H */
export function createTimelineSelection(input = {}) { return { kind:'TimelineSelection', clipIds:input.clipIds || [], trackId:input.trackId || null, time:input.time || 0 }; }
export function selectTimelineClip(selection, clipId, additive = false) { selection.clipIds = additive ? [...new Set([...selection.clipIds, clipId])] : [clipId]; return selection; }
export function clearTimelineSelection(selection) { selection.clipIds = []; selection.trackId = null; return selection; }
export function isClipSelected(selection, clipId) { return selection.clipIds.includes(clipId); }
