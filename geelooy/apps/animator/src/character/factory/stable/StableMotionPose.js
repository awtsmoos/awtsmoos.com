
// B"H

/**
 * @file StableMotionPose.js
 * @description
 * ============================================================================
 * CHAPTER: SIMPLE MOTION THAT CANNOT BREAK THE BODY
 * ============================================================================
 *
 * All motion is clamped. No gesture can flip the body into pieces.
 */
export class StableMotionPose {
  static get(data, side) {
    const mode = data.easyMotion || data.motionMode || 'idle';
    const t = data._renderTime || 0;
    const phase = data._lifePhase || 0;
    const s = Math.sin(t * 0.006 + phase);
    const talk = data.isTalking ? 1 : 0;

    if (mode === 'walk' || data.isWalking) {
      return {
        armElbowX: 12,
        armElbowY: 42,
        armHandX: 8,
        armHandY: 34 + side * s * 7,
        legSwing: side * s * 8
      };
    }

    if (mode === 'wave' && side === 1) {
      return {
        armElbowX: 24,
        armElbowY: -12,
        armHandX: 18 + Math.sin(t * 0.018) * 9,
        armHandY: -44,
        legSwing: 0
      };
    }

    if (mode === 'point' && side === 1) {
      return {
        armElbowX: 34,
        armElbowY: 18,
        armHandX: 42,
        armHandY: 2,
        legSwing: 0
      };
    }

    if (mode === 'think' && side === 1) {
      return {
        armElbowX: 17,
        armElbowY: 26,
        armHandX: -5,
        armHandY: -58,
        legSwing: 0
      };
    }

    if (mode === 'shrug') {
      return {
        armElbowX: 26,
        armElbowY: 30,
        armHandX: 16,
        armHandY: 6,
        legSwing: 0
      };
    }

    if (talk) {
      return {
        armElbowX: 17,
        armElbowY: 40,
        armHandX: 12,
        armHandY: 24 + Math.sin(t * 0.014 + side) * 7,
        legSwing: 0
      };
    }

    return {
      armElbowX: 9,
      armElbowY: 44,
      armHandX: 6,
      armHandY: 34,
      legSwing: side * Math.sin(t * 0.002 + phase) * 1.5
    };
  }
}
