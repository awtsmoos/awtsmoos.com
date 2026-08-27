/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createAudioFileSource(input = {}) {
  return createBaseSource({ type:'audioFile', name:'Audio File', ...input, settings:{ uri: input.uri || null, ...(input.settings || {}) } });
}
export function deserializeaudioFile(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
