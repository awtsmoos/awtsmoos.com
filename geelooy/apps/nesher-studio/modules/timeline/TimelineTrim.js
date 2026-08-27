/* B"H
Timeline trim: edit the edge while preserving the clip's inner light.
*/
export function trimClipStart(clip, newStart) { const delta = Math.min(clip.duration - 0.001, Math.max(0, newStart - clip.start)); clip.start += delta; clip.inPoint += delta * (clip.speed || 1); clip.duration -= delta; return clip; }
export function trimClipEnd(clip, newEnd) { clip.duration = Math.max(0.001, newEnd - clip.start); return clip; }
