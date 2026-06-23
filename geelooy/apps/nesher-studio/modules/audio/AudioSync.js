/* B"H */
export function createAudioSync(input = {}) { return { kind:'AudioSync', offsetMs:Number(input.offsetMs || 0) }; }
export function applySyncOffset(time, sync) { return Math.max(0, Number(time) + sync.offsetMs / 1000); }
export function setSyncOffset(sync, offsetMs) { sync.offsetMs = Number(offsetMs || 0); return sync; }
