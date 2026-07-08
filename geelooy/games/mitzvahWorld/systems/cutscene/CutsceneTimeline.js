// B"H
import { trackDuration } from "./CutsceneTrack.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function cutsceneTimeline(tracks = []) { return { tracks, duration:Math.max(0, ...tracks.map(trackDuration)) }; }
