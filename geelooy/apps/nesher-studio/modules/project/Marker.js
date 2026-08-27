/* B"H */
import { makeId, now, touch } from './ids.js';
export function createMarkerModel(input = {}) {
  return {
    id: input.id || makeId('marker'), kind:'Marker', time: Number(input.time || 0),
    color: input.color || '#83ffe7', note: input.note || '', chapter: !!input.chapter,
    name: input.name || (input.chapter ? 'Chapter marker' : 'Marker'), createdAt: now(input), updatedAt: Date.now()
  };
}
export const touchMarker = touch;
