/* B"H */
export function createNoiseGate(input = {}) { return { kind:'NoiseGate', threshold:Number(input.threshold ?? .015), reduction:Number(input.reduction ?? 0) }; }
export function applyNoiseGate(samples, gate = createNoiseGate()) { return Array.from(samples || [], sample => Math.abs(sample) < gate.threshold ? sample * gate.reduction : sample); }
