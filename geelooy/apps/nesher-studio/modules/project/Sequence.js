/* B"H */
import { makeId, now, touch } from './ids.js';
import { createTrackModel } from './Track.js';
export function createSequenceModel(input = {}) {
  const tracks = input.tracks?.length ? input.tracks : [createTrackModel({ id:'v1', trackKind:'video', name:'V1' }), createTrackModel({ id:'a1', trackKind:'audio', name:'A1' })];
  return {
    id: input.id || makeId('sequence'), kind:'Sequence', name: input.name || 'Sequence 1',
    width: Number(input.width || 1280), height: Number(input.height || 720), fps: Number(input.fps || 30),
    duration: Number(input.duration || 0), tracks, markers: input.markers || [],
    settings: input.settings || {}, nestedSequences: input.nestedSequences || [], multicam: input.multicam || null,
    createdAt: now(input), updatedAt: Date.now()
  };
}
export const touchSequence = touch;
