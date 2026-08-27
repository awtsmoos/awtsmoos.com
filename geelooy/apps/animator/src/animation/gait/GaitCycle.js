// B"H

/**
 * @file GaitCycle.js
 * @description
 * ============================================================================
 * CHAPTER: THE FOUR GATES OF WALKING
 * ============================================================================
 *
 * Bad walking comes from swinging legs like noodles. Real readable animation
 * needs phase: contact, down, passing, up. The foot plants, the knee bends,
 * the hip shifts, the body bobs, and the opposite arm answers.
 *
 * The Awtsmoos creates motion from nothing every instant. This module gives
 * that motion a small seder: a clean cycle of phases that any action can use.
 *
 * @class GaitCycle
 */
export class GaitCycle {
  /**
   * Samples one gait cycle.
   *
   * @param {Object} args - Sampling arguments.
   * @param {number} args.time - Render time.
   * @param {number} args.side - Limb side.
   * @param {number} args.speed - Cycle speed.
   * @param {number} args.stride - Stride size.
   * @param {number} args.lift - Foot lift.
   * @returns {Object} Gait values.
   */
  static sample({ time, side, speed, stride, lift }) {
    const offset = side > 0 ? 0 : 0.5;
    const phase = (time * speed + offset) % 1;
    const wave = Math.sin(phase * Math.PI * 2);
    const contact = this.contact(phase);
    const footLift = this.footLift(phase) * lift;
    const kneeBend = this.kneeBend(phase) * lift;
    const bodyBob = Math.abs(Math.sin(phase * Math.PI * 2)) * -2.4;

    return {
      phase,
      wave,
      contact,
      hipX: side * wave * stride * 0.34,
      kneeX: side * wave * stride * 0.52,
      ankleX: side * wave * stride * 0.74,
      footX: side * wave * stride * 0.86,
      kneeY: -kneeBend,
      ankleY: -footLift,
      bodyBob,
      armSwing: -side * wave
    };
  }

  /**
   * Returns planted-foot strength.
   *
   * @param {number} phase - Normalized phase.
   * @returns {number} Contact strength.
   */
  static contact(phase) {
    if (phase < 0.18) return 1;
    if (phase > 0.82) return 1;
    return 0;
  }

  /**
   * Returns foot lift curve.
   *
   * @param {number} phase - Normalized phase.
   * @returns {number} Lift amount.
   */
  static footLift(phase) {
    if (phase < 0.18 || phase > 0.82) return 0;
    const t = (phase - 0.18) / 0.64;
    return Math.sin(t * Math.PI);
  }

  /**
   * Returns knee bend curve.
   *
   * @param {number} phase - Normalized phase.
   * @returns {number} Bend amount.
   */
  static kneeBend(phase) {
    const pass = Math.sin(phase * Math.PI * 2 - Math.PI * 0.2);
    return Math.max(0, pass);
  }
}