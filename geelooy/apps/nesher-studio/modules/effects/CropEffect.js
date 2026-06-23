/* B"H */
export function createCropEffect(input = {}) { return { kind:'CropEffect', enabled:input.enabled ?? true, crop:{ top:input.top || 0, right:input.right || 0, bottom:input.bottom || 0, left:input.left || 0 } }; }
export function applyCropEffect(target, effect) { if (!effect.enabled) return target; target.crop = { ...(target.crop || {}), ...effect.crop }; return target; }
