/* B"H */
export function createAudioFramePool(input = {}) { return { kind:'AudioFramePool', maxSize:input.maxSize || 240, frames:input.frames || [], closed:0 }; }
export function pushAudioFrame(pool, frame) { pool.frames.push({ frame, at:Date.now() }); while (pool.frames.length > pool.maxSize) closeOldestAudioFrame(pool); return frame; }
export function takeAudioFrame(pool) { return pool.frames.shift()?.frame || null; }
export function closeOldestAudioFrame(pool) { const item = pool.frames.shift(); item?.frame?.close?.(); pool.closed += item ? 1 : 0; return item?.frame || null; }
export function drainAudioFramePool(pool) { while (pool.frames.length) closeOldestAudioFrame(pool); return pool; }
