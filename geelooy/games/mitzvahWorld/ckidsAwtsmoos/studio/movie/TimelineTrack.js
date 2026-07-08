// B"H
import { createTimelineClip } from "./TimelineClip.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function createTimelineTrack(input = {}) {
  return {
    id:input.id || `${input.kind || "track"}_${Date.now().toString(36)}`,
    kind:input.kind || "camera",
    label:input.label || input.kind || "Track",
    clips:(input.clips || []).map(createTimelineClip)
  };
}

export function addClip(track, clip) {
  const made = createTimelineClip(clip);
  track.clips.push(made);
  return made;
}

export default { createTimelineTrack, addClip };
