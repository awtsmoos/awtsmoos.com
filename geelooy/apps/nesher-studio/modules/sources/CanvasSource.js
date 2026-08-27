/* B"H */
import { createBaseSource, deserializeSource } from './BaseSource.js';
export function createCanvasSource(input = {}) {
  return createBaseSource({ type:'canvas', name:'Canvas', ...input, settings:{ canvasId: input.canvasId || null, ...(input.settings || {}) } });
}
export function deserializecanvas(data = {}, runtime = {}) { return deserializeSource(data, runtime); }
