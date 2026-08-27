/* B"H */
import { makeId, now, touch } from './ids.js';
export function createSourceModel(input = {}) {
  return {
    id: input.id || makeId('source'), kind:'Source', type: input.type || 'unknown',
    name: input.name || 'Source', visible: input.visible ?? true, locked: !!input.locked,
    opacity: Number(input.opacity ?? 1), transform: normalizeTransform(input.transform || input),
    filters: input.filters || [], audio: input.audio || null, health: input.health || { state:'idle' },
    settings: input.settings || {}, createdAt: now(input), updatedAt: Date.now()
  };
}
export function normalizeTransform(t = {}) {
  return { x:Number(t.x || 0), y:Number(t.y || 0), w:Number(t.w || t.width || 320), h:Number(t.h || t.height || 180), rotation:Number(t.rotation || 0), crop:t.crop || { top:0, right:0, bottom:0, left:0 } };
}
export const touchSource = touch;
