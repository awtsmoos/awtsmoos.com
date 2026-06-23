/* B"H
Mixer sums buses and applies tiny pure DSP helpers. Browser nodes may later
replace arrays, but behavior is already testable.
*/
import { busAudible } from './AudioBus.js';
import { applyGain } from './GainFilter.js';
import { applyLimiter } from './Limiter.js';
export function createAudioMixer(input = {}) { return { kind:'AudioMixer', buses:input.buses || [], masterLimiter:input.masterLimiter || { ceiling:.98 } }; }
export function mixBuses(mixer, sampleMap = {}) {
  const soloActive = mixer.buses.some(b => b.solo); let output = [];
  for (const bus of mixer.buses) if (busAudible(bus, soloActive)) output = sum(output, applyGain(sampleMap[bus.id] || [], bus.gain));
  return applyLimiter(output, mixer.masterLimiter.ceiling);
}
function sum(a, b) { const n = Math.max(a.length, b.length); return Array.from({ length:n }, (_, i) => (a[i] || 0) + (b[i] || 0)); }
