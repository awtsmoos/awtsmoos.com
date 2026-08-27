/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createWindowSource(input = {}) {
  return createBaseSource({ type:'window', name:'Window', ...input, settings:{ deviceId: input.deviceId || null, capture:'display-window', ...(input.settings || {}) } });
}
export function deserializewindow(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
