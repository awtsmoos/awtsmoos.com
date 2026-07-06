// B"H
export function createKeyframe(time = 0, value = {}, easing = "linear") {
  return { time:Number(time) || 0, value:{ ...value }, easing };
}

export function addKeyframe(clip, keyframe) {
  clip.keyframes ||= [];
  const made = createKeyframe(keyframe.time, keyframe.value, keyframe.easing);
  clip.keyframes.push(made);
  clip.keyframes.sort((a, b) => a.time - b.time);
  return made;
}

export default { createKeyframe, addKeyframe };
