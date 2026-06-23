/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createSceneSource(input = {}) {
  return createBaseSource({ type:'scene', name:'Nested Scene', ...input, settings:{ sceneId: input.sceneId || null, ...(input.settings || {}) } });
}
export function deserializescene(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
