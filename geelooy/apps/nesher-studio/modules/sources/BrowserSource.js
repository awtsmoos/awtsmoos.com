/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createBrowserSource(input = {}) {
  return createBaseSource({ type:'browser', name:'Browser Source', ...input, settings:{ url: input.url || 'about:blank', ...(input.settings || {}) } });
}
export function deserializebrowser(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
