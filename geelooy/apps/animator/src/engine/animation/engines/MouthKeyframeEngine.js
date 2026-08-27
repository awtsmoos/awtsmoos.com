// B”H
// The Mouth Keyframe Engine - The rhythm of the Awtsmoos.

export class MouthKeyframeEngine {
  constructor(keyframeManager) {
    this.keyframes = keyframeManager;
  }

  // Define a "talk" sequence
  createTalkSequence(partId, duration) {
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const time = (i / steps) * duration;
      const mouthOpen = Math.random() * 0.8 + 0.2;
      this.keyframes.addKeyframe(partId, time, { mouthOpen });
    }
    // Close mouth at the end
    this.keyframes.addKeyframe(partId, duration, { mouthOpen: 0 });
  }

  getMouthState(partId, currentTime) {
    return this.keyframes.interpolate(partId, currentTime);
  }
}
