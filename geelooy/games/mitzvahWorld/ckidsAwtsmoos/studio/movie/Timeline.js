// B"H
import { createTimelineTrack, addClip } from "./TimelineTrack.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addKeyframe } from "./TimelineKeyframes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function createTimeline(input = {}) {
  return {
    id:input.id || "cutscene_timeline",
    duration:Math.max(1, Number(input.duration || 30)),
    playhead:Number(input.playhead || 0),
    zoom:Number(input.zoom || 1),
    tracks:(input.tracks || []).map(createTimelineTrack)
  };
}

export function addTrack(timeline, kind, label = kind) {
  const track = createTimelineTrack({ kind, label });
  timeline.tracks.push(track);
  return track;
}

export function ensureTrack(timeline, kind, label = kind) {
  return timeline.tracks.find(track => track.kind === kind) || addTrack(timeline, kind, label);
}

export function addTimelineClip(timeline, kind, clip) {
  return addClip(ensureTrack(timeline, kind), { kind, ...clip });
}

export function addTimelineKeyframe(timeline, clipId, keyframe) {
  for (const track of timeline.tracks) {
    const clip = track.clips.find(item => item.id === clipId);
    if (clip) return addKeyframe(clip, keyframe);
  }
  return null;
}

export default { createTimeline, addTrack, ensureTrack, addTimelineClip, addTimelineKeyframe };
