/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createAudioInputSource(input = {}) {
  return createBaseSource({ type:'audioInput', name:'Audio Input', ...input, settings:{ deviceId: input.deviceId || null, capture:'audio-input', ...(input.settings || {}) } });
}
export function deserializeaudioInput(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
