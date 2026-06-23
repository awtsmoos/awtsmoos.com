/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createImageSource(input = {}) {
  return createBaseSource({ type:'image', name:'Image', ...input, settings:{ uri: input.uri || null, ...(input.settings || {}) } });
}
export function deserializeimage(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
