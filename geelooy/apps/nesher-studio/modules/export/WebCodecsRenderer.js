/* B"H */
export function createWebCodecsRenderer(input = {}) { return { kind:'WebCodecsRenderer', width:input.width || 1280, height:input.height || 720, fps:input.fps || 30, frameCount:0, dropped:0 }; }
export function planFrameRender(renderer, durationSeconds) { renderer.frameCount = Math.max(1, Math.round(durationSeconds * renderer.fps)); return renderer; }
export function recordDroppedFrame(renderer) { renderer.dropped += 1; return renderer; }
