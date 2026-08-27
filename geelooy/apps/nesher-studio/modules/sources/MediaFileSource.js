/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createMediaFileSource(input = {}) {
  return createBaseSource({ type:'media', name:'Media File', ...input, settings:{ uri: input.uri || null, loop: !!input.loop, ...(input.settings || {}) } });
}
export function deserializemedia(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
