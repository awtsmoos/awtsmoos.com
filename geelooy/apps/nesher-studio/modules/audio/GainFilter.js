/* B"H */
export function createGainFilter(input = {}) { return { kind:'GainFilter', gain:Number(input.gain ?? 1) }; }
export function applyGain(samples, gain = 1) { return Array.from(samples || [], sample => sample * gain); }
export function updateGainFilter(filter, patch = {}) { if ('gain' in patch) filter.gain = Number(patch.gain); return filter; }
