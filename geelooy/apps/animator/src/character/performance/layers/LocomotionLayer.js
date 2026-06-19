// B"H
import { PerformanceLayerMixer as Mix } from '../core/PerformanceLayerMixer.js';
import { GaitClock } from '../gait/GaitClock.js';
import { WalkPhaseResolver } from '../gait/WalkPhaseResolver.js';
import { FootPlantSolver } from '../gait/FootPlantSolver.js';
import { HipMotionSolver } from '../gait/HipMotionSolver.js';

/**
 * @file LocomotionLayer.js
 * @description
 * Chapter: The body finally carried weight across the frame.
 * Walking now has planted feet, directional lean, torso follow-through, and
 * arm swing tied to actual travel progress. Closeups can freeze the body while
 * long shots show readable locomotion.
 */
export class LocomotionLayer {
  /**
   * Applies locomotion.
   *
   * @param {Object} pose - Pose.
   * @param {Object} state - Performance state.
   * @param {Object} view - View profile.
   * @param {number} time - Render time.
   * @returns {void}
   */
  static apply(pose, state = {}, view, time = 0) {
    const type = state.locomotion?.type || 'idle';
    if (type === 'idle') return this.applyIdle(pose, time, state);

    const raw = state.raw || {};
    const clock = GaitClock.sample(time, state, raw);
    const direction = this.direction(raw);
    const motion = this.motion(type, raw);
    const leftPhase = WalkPhaseResolver.resolve(clock.left);
    const rightPhase = WalkPhaseResolver.resolve(clock.right);

    Mix.leg(pose, 'left', FootPlantSolver.solve(leftPhase, -1, direction, motion.stride), 1);
    Mix.leg(pose, 'right', FootPlantSolver.solve(rightPhase, 1, direction, motion.stride), 1);

    Mix.addBody(pose, {
      ...HipMotionSolver.sample(clock.phase, motion.intensity),
      torsoLean: direction * motion.lean,
      shoulderCounter: Math.sin(clock.phase * Math.PI * 2) * motion.shoulder,
      headNod: Math.sin(clock.phase * Math.PI * 2) * motion.head
    }, 1);

    this.applyDefaultArmSwing(pose, clock.phase, direction, motion);
    pose.action = type;
  }

  /** @param {Object} raw @returns {number} */
  static direction(raw = {}) {
    if (Number.isFinite(raw._travelDirection)) return raw._travelDirection;
    return raw.flipX ? -1 : 1;
  }

  /** @param {string} type @param {Object} raw @returns {Object} */
  static motion(type, raw = {}) {
    if (type === 'run') {
      return {
        stride: 46,
        intensity: 1.12,
        shoulder: 8,
        lean: 3.2,
        head: 1.8,
        armAmount: 24,
        elbowY: 26,
        handY: 18
      };
    }

    if (raw.motionMode === 'worldTravel') {
      return {
        stride: 34,
        intensity: 0.86,
        shoulder: 4.5,
        lean: 1.8,
        head: 0.8,
        armAmount: 15,
        elbowY: 36,
        handY: 29
      };
    }

    return {
      stride: 18,
      intensity: 0.42,
      shoulder: 1.8,
      lean: 0.4,
      head: 0.3,
      armAmount: 8,
      elbowY: 38,
      handY: 31
    };
  }

  /** @param {Object} pose @param {number} time @param {Object} state @returns {void} */
  static applyIdle(pose, time, state = {}) {
    const s = Math.sin(time * 0.0017 + (state.raw?._index || 0));

    Mix.addBody(pose, {
      breath: Math.sin(time * 0.002) * 1.2,
      bob: s * 0.8,
      torsoLean: s * 0.35,
      headNod: Math.sin(time * 0.0012) * 0.7
    }, 1);
  }

  /** @param {Object} pose @param {number} phase @param {number} direction @param {Object} motion @returns {void} */
  static applyDefaultArmSwing(pose, phase, direction, motion) {
    const swing = Math.sin(phase * Math.PI * 2);
    const amount = motion.armAmount;

    Mix.arm(pose, 'left', {
      elbowX: 13 + swing * amount * direction,
      elbowY: motion.elbowY,
      handX: 8 + swing * amount * 0.78 * direction,
      handY: motion.handY
    }, 0.72);

    Mix.arm(pose, 'right', {
      elbowX: 13 - swing * amount * direction,
      elbowY: motion.elbowY,
      handX: 8 - swing * amount * 0.78 * direction,
      handY: motion.handY
    }, 0.72);
  }
}
