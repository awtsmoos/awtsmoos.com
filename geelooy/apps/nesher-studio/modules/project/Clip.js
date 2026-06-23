/* B"H
A clip is a small river of time: start, in, out, duration, effects, and
keyframes. The Awtsmoos lets edits cut without confusion, so precedence is
made explicit and the model can be imported by real tests.
*/
import { makeId, now, touch, numberOr } from './ids.js';

export function createClipModel(input = {}) {
  const inferred = Math.max(0, numberOr(input.outPoint, 0) - numberOr(input.inPoint, 0));
  const duration = numberOr(input.duration, inferred || 1);
  return {
    id: input.id || makeId('clip'), kind:'Clip', assetId: input.assetId || null,
    name: input.name || 'Clip', trackId: input.trackId || null,
    start: numberOr(input.start, 0), duration,
    inPoint: numberOr(input.inPoint, 0), outPoint: numberOr(input.outPoint, duration),
    selected: !!input.selected, disabled: !!input.disabled, linkedClipIds: input.linkedClipIds || [],
    effects: input.effects || [], keyframes: input.keyframes || [], createdAt: now(input), updatedAt: Date.now()
  };
}

export const touchClip = touch;
