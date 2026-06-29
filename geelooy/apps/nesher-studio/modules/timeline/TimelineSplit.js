/* B"H
Timeline split: one clip becomes two vessels without losing its source.
*/
export function splitClip(clip, at) {
  if (at <= clip.start || at >= clip.start + clip.duration) return null;
  const left = { ...clip, duration:at - clip.start };
  const right = { ...clip, id:`${clip.id}-split-${Date.now()}`, start:at, duration:clip.start + clip.duration - at, inPoint:clip.inPoint + (at - clip.start) * (clip.speed || 1) };
  return [left, right];
}
