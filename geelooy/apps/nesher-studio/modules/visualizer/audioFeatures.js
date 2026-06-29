/* B"H
Audio features: raw bins become bass, mid, treble, beat, and pulse for renderers.
*/
export function analyzeAudioFeatures(freq, runtime = {}) {
  const bass = avg(freq, 0, .22), mid = avg(freq, .22, .62), treble = avg(freq, .62, 1), level = avg(freq, 0, 1);
  const beat = bass > Math.max(.28, runtime.prevBass * 1.22); runtime.prevBass = bass; runtime.beatEnergy = beat ? 1 : Math.max(0, (runtime.beatEnergy || 0) * .88 - .02);
  return { bass, mid, treble, level, beat, pulse:runtime.beatEnergy || 0 };
}
export function band(frame, name) { return frame.features?.[name] ?? frame.level ?? 0; }
function avg(values, start, end) { const a = Math.floor(values.length * start), b = Math.max(a + 1, Math.floor(values.length * end)); let sum = 0; for (let i = a; i < b; i++) sum += Math.abs(values[i] || 0); return sum / (b - a); }
