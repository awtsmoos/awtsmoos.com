/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createMonitorSource(input = {}) {
  return createBaseSource({ type:'monitor', name:'Monitor', ...input, settings:{ deviceId: input.deviceId || null, capture:'display-monitor', ...(input.settings || {}) } });
}
export function deserializemonitor(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
