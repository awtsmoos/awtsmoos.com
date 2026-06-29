/* B"H
Timeline commands: edit verbs are separated from pointer chaos.
*/
import { createClip } from './ClipModel.js';
import { addTrackClip } from './TrackModel.js';
import { findTimelineClip } from './TimelineModel.js';
import { splitClip } from './TimelineSplit.js';
export function commandAddClip(timeline, trackId, clipInput) { const track = timeline.tracks.find(t => t.id === trackId) || timeline.tracks[0]; return addTrackClip(track, createClip({ ...clipInput, trackId:track.id })); }
export function commandSplitClip(timeline, clipId, at) { const found = findTimelineClip(timeline, clipId); if (!found) return null; const pair = splitClip(found.clip, at); if (!pair) return null; const i = found.track.clips.indexOf(found.clip); found.track.clips.splice(i, 1, ...pair); return pair; }
