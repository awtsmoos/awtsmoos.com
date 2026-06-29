/* B"H
Timeline model: many tracks become one editable sequence.
*/
import { createTrack } from './TrackModel.js';
export function createTimelineModel(input = {}) { return { id:input.id || 'sequence-main', fps:input.fps || 30, playhead:0, zoom:1, tracks:input.tracks || [createTrack({ id:'v1', name:'Video 1', kind:'video' }), createTrack({ id:'a1', name:'Audio 1', kind:'audio' })], selection:[] }; }
export function findTimelineClip(timeline, clipId) { for (const track of timeline.tracks) { const clip = track.clips.find(c => c.id === clipId); if (clip) return { track, clip }; } return null; }
