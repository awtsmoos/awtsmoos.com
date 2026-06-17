// B"H
export function cutscenePlaybackReport(runtime = {}) { return { scene:runtime.currentScene?.id || null, time:runtime.state?.current?.time || 0, queued:runtime.queue?.packets?.length || 0, scenes:runtime.scenes?.size || 0 }; }
export default cutscenePlaybackReport;
