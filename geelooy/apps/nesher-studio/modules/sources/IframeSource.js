/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createIframeSource(input = {}) {
  return createBaseSource({ type:'iframe', name:'Iframe Source', ...input, settings:{ url: input.url || 'about:blank', ...(input.settings || {}) } });
}
export function deserializeiframe(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
