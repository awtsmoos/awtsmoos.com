/* B"H */
export function createStreamHealth(input = {}) { return { kind:'StreamHealth', state:input.state || 'idle', fps:input.fps || 0, bitrate:input.bitrate || 0, droppedFrames:input.droppedFrames || 0, uploadedBytes:input.uploadedBytes || 0, latencyMs:input.latencyMs || 0, errors:input.errors || [], updatedAt:Date.now() }; }
export function updateStreamHealth(health, patch = {}) { Object.assign(health, patch, { updatedAt:Date.now() }); return health; }
export function recordStreamError(health, error) { health.errors.push({ at:Date.now(), message:String(error?.message || error) }); health.state = 'error'; return health; }
export function streamHealthSummary(health) { return `${health.state} ${health.fps}fps ${Math.round(health.bitrate/1000)}kbps drops=${health.droppedFrames}`; }
