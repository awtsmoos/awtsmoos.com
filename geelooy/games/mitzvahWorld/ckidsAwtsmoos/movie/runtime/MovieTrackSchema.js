// B"H
/** @file MovieTrackSchema.js @description Timeline tracks for cameras, actors, audio, captions, lights, and AI blocking. */
export const MOVIE_TRACK_TYPES = Object.freeze(["camera","actor","audio","dialogue","caption","light","effect","marker","region","ai-storyboard","ai-camera","ai-lipsync"]);
export function createTrack(type, items = [], data = {}) { if (!MOVIE_TRACK_TYPES.includes(type)) throw new Error(`Unknown movie track: ${type}`); return { id:data.id || `${type}_${Date.now()}`, type, items, muted:false, locked:false, ...data }; }
export function createKeyframe(time, value, easing = "linear") { return { time:Number(time) || 0, value, easing }; }
export default { MOVIE_TRACK_TYPES, createTrack, createKeyframe };
