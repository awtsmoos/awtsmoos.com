/* B"H */
export function createBlurEffect(input = {}) { return { kind:'BlurEffect', enabled:input.enabled ?? true, radius:Number(input.radius || 4) }; }
export function cssBlur(effect) { return effect.enabled ? `blur(${effect.radius}px)` : 'none'; }
