/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createTabSource(input = {}) {
  return createBaseSource({ type:'tab', name:'Browser Tab', ...input, settings:{ deviceId: input.deviceId || null, capture:'display-browser', ...(input.settings || {}) } });
}
export function deserializetab(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
