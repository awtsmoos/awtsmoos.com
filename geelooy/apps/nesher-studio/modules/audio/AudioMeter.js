/* B"H */
export function createAudioMeter(input = {}) { return { kind:'AudioMeter', peak:input.peak || 0, rms:input.rms || 0, hold:input.hold || 0 }; }
export function measureSamples(samples, meter = createAudioMeter()) {
  let sum = 0, peak = 0;
  for (const sample of samples || []) { const v = Math.abs(Number(sample) || 0); peak = Math.max(peak, v); sum += v * v; }
  meter.peak = peak; meter.rms = samples?.length ? Math.sqrt(sum / samples.length) : 0; meter.hold = Math.max(meter.hold * .95, peak);
  return meter;
}
export function meterDb(value) { return value <= 0 ? -Infinity : 20 * Math.log10(value); }
