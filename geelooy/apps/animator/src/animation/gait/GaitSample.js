// B"H
import { CycleMath } from '../math/CycleMath.js';
import { PhaseClock } from './PhaseClock.js';
import { FootPlant } from './FootPlant.js';
import { STRIDE_PROFILES } from './StrideProfile.js';

/**
 * @file GaitSample.js
 * @description
 * ============================================================================
 * CHAPTER: THE WALKING SOUL SPLIT INTO TWO OPPOSITE FEET
 * ============================================================================
 *
 * This is the real gait sampler. It gives each side a phase, plant state, foot
 * travel, knee lift, ankle lift, body bob, and arm counter-swing.
 *
 * @class GaitSample
 */
export class GaitSample {
  /**
   * Samples walk or run.
   *
   * @param {Object} args - Sampling arguments.
   * @param {number} args.time - Render time.
   * @param {number} args.side - -1 left, 1 right.
   * @param {string} args.kind - walk or run.
   * @returns {Object} Pose offsets.
   */
  static sample({ time, side, kind }) {
    const p = STRIDE_PROFILES[kind] || STRIDE_PROFILES.walk;
    const phase = PhaseClock.phase({ time, side, cyclesPerSecond: p.cyclesPerSecond });
    const foot = FootPlant.sample(phase);
    const forward = CycleMath.cos01(phase) * p.stride;
    const counter = CycleMath.cos01(phase + 0.5) * p.arm;
    const lift = foot.lift * p.lift;
    const knee = foot.lift * p.knee;
    const bob = -Math.abs(CycleMath.sin01(phase)) * p.bob;

    return {
      phase,
      planted: foot.planted,
      contact: foot.contact,
      hipX: side * forward * 0.12,
      kneeX: side * forward * 0.42,
      ankleX: side * forward * 0.62,
      footX: side * forward * 0.78,
      kneeLift: -knee,
      ankleLift: -lift,
      bodyBob: bob,
      armSwing: counter,
      torsoLean: side * counter * 0.025
    };
  }
}