/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createWebcamSource(input = {}) {
  return createBaseSource({ type:'webcam', name:'Webcam', ...input, settings:{ deviceId: input.deviceId || null, capture:'user-media', ...(input.settings || {}) } });
}
export function deserializewebcam(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
