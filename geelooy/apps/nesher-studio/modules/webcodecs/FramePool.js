/* B"H */
export function createFramePool(input = {}) { return { kind:'FramePool', maxSize:input.maxSize || 120, frames:input.frames || [], recycled:0, closed:0 }; }
export function pushFrame(pool, frame) { pool.frames.push({ frame, at:Date.now() }); while (pool.frames.length > pool.maxSize) closeOldestFrame(pool); return frame; }
export function takeFrame(pool) { return pool.frames.shift()?.frame || null; }
export function closeOldestFrame(pool) { const item = pool.frames.shift(); item?.frame?.close?.(); pool.closed += item ? 1 : 0; return item?.frame || null; }
export function drainFramePool(pool) { while (pool.frames.length) closeOldestFrame(pool); return pool; }
