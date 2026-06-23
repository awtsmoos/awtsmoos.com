/* B"H */
export function createCompressor(input = {}) { return { kind:'Compressor', threshold:Number(input.threshold ?? .5), ratio:Number(input.ratio ?? 4) }; }
export function applyCompressor(samples, c = createCompressor()) { return Array.from(samples || [], sample => compress(sample, c.threshold, c.ratio)); }
function compress(sample, threshold, ratio) { const sign = Math.sign(sample); const abs = Math.abs(sample); return abs <= threshold ? sample : sign * (threshold + (abs - threshold) / ratio); }
