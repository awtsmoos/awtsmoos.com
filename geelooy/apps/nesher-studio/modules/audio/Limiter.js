/* B"H */
export function createLimiter(input = {}) { return { kind:'Limiter', ceiling:Number(input.ceiling ?? .98) }; }
export function applyLimiter(samples, ceiling = .98) { const c = Math.abs(ceiling); return Array.from(samples || [], sample => Math.max(-c, Math.min(c, sample))); }
