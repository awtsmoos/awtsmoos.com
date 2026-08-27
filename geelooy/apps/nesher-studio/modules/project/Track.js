/* B"H */
import { makeId, now, touch } from './ids.js';
export function createTrackModel(input = {}) {
  return {
    id: input.id || makeId('track'), kind:'Track', trackKind: input.trackKind || input.type || 'video',
    name: input.name || `${input.trackKind || input.type || 'video'} track`, clips: input.clips || [],
    locked: !!input.locked, muted: !!input.muted, solo: !!input.solo, targeted: input.targeted ?? true,
    height: Number(input.height || 72), createdAt: now(input), updatedAt: Date.now()
  };
}
export const touchTrack = touch;
