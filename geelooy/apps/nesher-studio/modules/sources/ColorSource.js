/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createColorSource(input = {}) {
  return createBaseSource({ type:'color', name:'Color', ...input, settings:{ color: input.color || '#000000', ...(input.settings || {}) } });
}
export function deserializecolor(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
