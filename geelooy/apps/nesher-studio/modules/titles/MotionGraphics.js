/* B"H */
export function createMotionGraphics(input = {}) { return { kind:'MotionGraphics', layers:input.layers || [], keyframes:input.keyframes || [] }; }
export function addMotionLayer(graphics, layer) { graphics.layers.push(layer); return layer; }
export function keyframeAt(graphics, time) { return graphics.keyframes.filter(k => k.time <= time).at(-1) || null; }
