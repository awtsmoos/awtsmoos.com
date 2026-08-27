/* B"H */
export function createReplayBuffer(input = {}) { return { kind:'ReplayBuffer', seconds:input.seconds || 30, frames:[], fps:input.fps || 30, maxFrames:(input.seconds || 30) * (input.fps || 30) }; }
export function pushReplayFrame(buffer, frame) { buffer.frames.push({ at:Date.now(), frame }); while (buffer.frames.length > buffer.maxFrames) buffer.frames.shift(); return buffer; }
export function exportReplayDescriptor(buffer) { return { kind:'replay-buffer', frames:buffer.frames.length, seconds:buffer.seconds }; }
