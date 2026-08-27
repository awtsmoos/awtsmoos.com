/* B"H
Runtime support: turn raw feature sparks into an operator-facing support report.
*/
import { webCodecsFeatureGate, canRunManualVideo, canRunWorkerEncoding } from './WebCodecsFeatureGate.js';
export function createEncoderRuntimeSupport(scope = globalThis) {
  const gate = webCodecsFeatureGate(scope);
  return { gate, manualVideo:canRunManualVideo(scope), workerEncoding:canRunWorkerEncoding(scope), manualAudio:gate.audioEncoder && gate.trackProcessor };
}
export function supportWarnings(support) {
  const warnings = [];
  if (!support.manualVideo) warnings.push('WebCodecs video encode unavailable');
  if (!support.manualAudio) warnings.push('WebCodecs audio encode or track processor unavailable');
  if (!support.workerEncoding) warnings.push('worker OffscreenCanvas encode path unavailable; main-thread path remains');
  return warnings;
}
