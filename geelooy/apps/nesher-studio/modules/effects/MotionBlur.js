/* B"H */
export function createMotionBlur(input = {}) { return { kind:'MotionBlur', enabled:input.enabled ?? true, samples:Number(input.samples || 8), shutter:Number(input.shutter ?? .5) }; }
export function motionBlurWeight(effect) { return effect.enabled ? effect.samples * effect.shutter : 0; }
