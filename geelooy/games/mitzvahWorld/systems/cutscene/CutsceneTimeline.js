// B"H
import { trackDuration } from "./CutsceneTrack.js";
export function cutsceneTimeline(tracks = []) { return { tracks, duration:Math.max(0, ...tracks.map(trackDuration)) }; }
