// B"H
export class BodyPoseRenderBridge {
  static from(performancePose = {}, data = {}) {
    return {
      torsoBreathScale: 1 + this.clamp(Number(performancePose.breath ?? data.breathMotion ?? 0), -0.04, 0.04),
      shoulderOffsetY: this.clamp(Number(performancePose.shoulder ?? data.shoulderMotion ?? 0) * 18, -4, 4),
      headRotation: this.clamp(Number(performancePose.headTilt ?? data.headTilt ?? 0) * 0.018, -0.12, 0.12),
      headOffsetY: this.clamp(Number(performancePose.headNod ?? data.headNod ?? 0), -4, 4),
      hipOffsetX: this.clamp(Number(performancePose.weight ?? data.weightShift ?? 0) * 8, -5, 5),
      weightShiftAmount: this.clamp(Number(performancePose.weight ?? data.weightShift ?? 0), -1, 1),
      handPose: performancePose.hand || data.handPerformance || data.gesture || 'rest'
    };
  }
  static clamp(v, min, max) { return Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0)); }
}
