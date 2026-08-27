/* B"H
Worker state: a small vessel for off-main-thread encode lifecycles.
*/
import { createEncodingTelemetry } from '../core/EncodingTelemetry.js';
export function createWorkerRecordingState(config = {}) {
  return { config, ready:false, stopping:false, telemetry:createEncodingTelemetry(), pendingFrames:0, errors:[] };
}
export function markWorkerReady(state) { state.ready = true; return state; }
export function markWorkerStopping(state) { state.stopping = true; return state; }
