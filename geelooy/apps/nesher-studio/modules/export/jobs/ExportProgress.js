/* B"H
Export progress: numbers become a window into the hidden encoding river.
*/
export function createExportProgress(totalFrames = 0) { return { totalFrames, encodedFrames:0, audioFrames:0, droppedFrames:0, queueDepth:0, startedAt:Date.now() }; }
export function updateExportProgress(progress, patch = {}) { Object.assign(progress, patch); return progress; }
export function exportProgressPercent(progress) { return progress.totalFrames ? Math.min(100, Math.round((progress.encodedFrames / progress.totalFrames) * 100)) : 0; }
