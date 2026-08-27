/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createTextSource(input = {}) {
  return createBaseSource({ type:'text', name:'Text', ...input, settings:{ text: input.text || 'Text', font: input.font || '48px system-ui', ...(input.settings || {}) } });
}
export function deserializetext(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
