/* B"H
Recording runtime plan: decide the fastest safe vessel without hiding fallback truth.
*/
import { createEncoderRuntimeSupport, supportWarnings } from '../core/EncoderRuntimeSupport.js';
export function createRecordingRuntimePlan(scope = globalThis, preference = {}) {
  const support = createEncoderRuntimeSupport(scope);
  const requestedWorker = preference.worker !== false;
  const mode = requestedWorker && support.workerEncoding ? 'worker-webcodecs' : 'main-thread-webcodecs';
  return { mode, support, warnings:supportWarnings(support), stableFallback:'main-thread-webcodecs' };
}
export function recordingPlanSummary(plan) {
  return `${plan.mode}; warnings ${plan.warnings.length}`;
}
