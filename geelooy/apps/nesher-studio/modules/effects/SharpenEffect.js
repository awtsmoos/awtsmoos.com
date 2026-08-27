/* B"H */
export function createSharpenEffect(input = {}) { return { kind:'SharpenEffect', enabled:input.enabled ?? true, amount:Number(input.amount || .5) }; }
export function describeSharpenEffect(effect) { return `sharpen:${effect.amount}`; }
