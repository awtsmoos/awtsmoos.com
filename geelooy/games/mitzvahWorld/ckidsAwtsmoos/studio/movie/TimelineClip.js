// B"H
export function createTimelineClip(input = {}) {
  return {
    id:input.id || `clip_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    kind:input.kind || "camera",
    label:input.label || input.kind || "Clip",
    start:Number(input.start || 0),
    duration:Math.max(.1, Number(input.duration || 2)),
    payload:{ ...(input.payload || {}) },
    keyframes:Array.isArray(input.keyframes) ? input.keyframes : []
  };
}

export default { createTimelineClip };
