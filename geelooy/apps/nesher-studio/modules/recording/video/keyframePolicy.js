/* B"H
Keyframe policy: regular anchors hold the river of frames together.
*/
export function shouldRequestKeyFrame(frameIndex, fps = 30, profile = {}) {
  const interval = Math.max(1, Math.round(Number(profile.keyFrameSeconds || 2) * fps));
  return frameIndex % interval === 0;
}
