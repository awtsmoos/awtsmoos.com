
// B"H

/**
 * @file HumanWalkCycle.js
 * @description
 * ============================================================================
 * CHAPTER: THE FOOT THAT PLANTED, PUSHED, LIFTED, AND REACHED
 * ============================================================================
 *
 * The previous motion was a loose sine wave. This module gives a readable
 * stylized walk: foot contact, swing, lift, pelvis bob, shoulder counter-swing,
 * and head stabilization.
 *
 * @module HumanWalkCycle
 */

/**
 * @constant WALK_STYLES
 * @description
 * Data-driven walking styles.
 */
export const WALK_STYLES = {
  calm: { speed: 1.25, stride: 28, lift: 10, bob: 5, sway: 3, arm: 17, contact: 0.58 },
  quick: { speed: 1.85, stride: 36, lift: 14, bob: 7, sway: 4, arm: 24, contact: 0.52 },
  heavy: { speed: 0.95, stride: 31, lift: 7, bob: 9, sway: 5, arm: 13, contact: 0.66 },
  joyful: { speed: 1.75, stride: 38, lift: 18, bob: 10, sway: 7, arm: 29, contact: 0.5 },
  idle: { speed: 0.35, stride: 2, lift: 0, bob: 2, sway: 1.5, arm: 3, contact: 1 }
};

/**
 * @class HumanWalkCycle
 * @description
 * Samples human locomotion motion.
 */
export class HumanWalkCycle {
  /**
   * Samples full motion.
   *
   * @param {Object} character - Character.
   * @param {number} time - Time.
   * @param {number} scale - Scale.
   * @returns {Object} Motion data.
   */
  static sample(character = {}, time = 0, scale = 1) {
    const perf = character.currentPerformance || {};
    const action = perf.locomotion || character.action || 'idle';
    const emotion = perf.emotion || character.emotion || 'calm';
    const styleName = action === 'run' ? 'quick' : action === 'walk' ? (emotion === 'happy' ? 'joyful' : 'calm') : 'idle';
    const style = WALK_STYLES[styleName] || WALK_STYLES.calm;
    const t = time / 1000 * style.speed;
    const left = this.foot(t, -1, style, scale);
    const right = this.foot(t + 0.5, 1, style, scale);
    const moving = action === 'walk' || action === 'run';

    return {
      action,
      moving,
      style,
      left,
      right,
      pelvisBob: moving ? -Math.abs(Math.sin(t * Math.PI * 2)) * style.bob * scale : Math.sin(time * 0.002) * style.bob * scale,
      hipSway: Math.sin(t * Math.PI * 2) * style.sway * scale,
      shoulderSway: -Math.sin(t * Math.PI * 2) * style.sway * 0.65 * scale,
      armSwing: Math.sin(t * Math.PI * 2) * style.arm * scale,
      headCounter: moving ? Math.abs(Math.sin(t * Math.PI * 2)) * style.bob * 0.35 * scale : 0,
      breath: Math.sin(time * 0.0024) * 2.2 * scale
    };
  }

  /**
   * Samples one foot.
   *
   * @param {number} phaseRaw - Phase.
   * @param {number} side - Side.
   * @param {Object} style - Style.
   * @param {number} scale - Scale.
   * @returns {Object} Foot data.
   */
  static foot(phaseRaw, side, style, scale) {
    const phase = ((phaseRaw % 1) + 1) % 1;
    const planted = phase < style.contact;
    const swing = planted ? 0 : (phase - style.contact) / Math.max(0.001, 1 - style.contact);
    const strideWave = Math.cos(phase * Math.PI * 2);
    return {
      planted,
      phase,
      x: strideWave * style.stride * scale,
      y: planted ? 0 : -Math.sin(swing * Math.PI) * style.lift * scale,
      knee: planted ? 4 * scale : Math.sin(swing * Math.PI) * style.lift * 1.35 * scale,
      toe: planted ? Math.sin(phase / style.contact * Math.PI) * 0.18 : -0.08,
      side
    };
  }
}
