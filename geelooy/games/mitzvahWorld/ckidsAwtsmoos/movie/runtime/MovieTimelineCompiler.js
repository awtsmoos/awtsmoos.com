// B"H
/** @file MovieTimelineCompiler.js @description Compiles Premiere-like JSON into runtime-addressed movie commands. */
import { MOVIE_TRACK_TYPES } from "./MovieTrackSchema.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function itemCommand(track, item) { return { trackId:track.id, type:track.type, at:Number(item.time || item.start || 0), duration:Number(item.duration || 0), target:item.target || item.actor || item.camera || null, value:item.value ?? item }; }
export function compileMovieTimeline(timeline = {}) {
  const tracks = Array.isArray(timeline.tracks) ? timeline.tracks : [];
  const commands = [];
  for (const track of tracks) { if (!MOVIE_TRACK_TYPES.includes(track.type)) continue; for (const item of track.items || []) commands.push(itemCommand(track, item)); }
  return { id:timeline.id || `timeline_${Date.now()}`, fps:timeline.fps || 30, duration:timeline.duration || Math.max(0, ...commands.map(c => c.at + c.duration)), tracks:tracks.length, commands:commands.sort((a,b)=>a.at-b.at) };
}
export default compileMovieTimeline;
