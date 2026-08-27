// B"H
import { StableGait } from './StableGait.js';

/**
 * @file StableActionPose.js
 * @description
 * ============================================================================
 * CHAPTER: THE SMALL ACTION REGISTRY USED BY THE REAL LIMBS
 * ============================================================================
 *
 * StableLimbs2D imports this file directly. Every action returns one plain
 * pose object. No switches outside this owner.
 *
 * @class StableActionPose
 */
export class StableActionPose {
  /**
   * Resolves pose.
   *
   * @param {Object} data - Character.
   * @param {number} side - Side.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static get(data = {}, side, time) {
    const mode = data.acting || data.gesture || data.motion || (data.isWalking ? 'walk' : 'idle');
    const map = {
      idle: () => this.idle(side, time),
      walk: () => StableGait.sample({ side, time, mode: 'walk' }),
      run: () => StableGait.sample({ side, time, mode: 'run' }),
      talk: () => this.talk(side, time),
      explain: () => this.talk(side, time),
      point: () => this.point(side),
      wave: () => this.wave(side, time),
      throw_windup: () => this.throwWindup(side),
      throw_release: () => this.throwRelease(side),
      throw_follow: () => this.throwFollow(side),
      throw: () => this.throwRelease(side),
      catch: () => this.catch(side)
    };

    return (map[mode] || map.idle)();
  }

  /**
   * Idle.
   *
   * @param {number} side - Side.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static idle(side, time) {
    const d = Math.sin(time * 0.0016 + (side > 0 ? 0 : Math.PI));
    return { armElbowX: 10, armElbowY: 43 + d, armHandX: 7, armHandY: 34 + d, hipX: 0, kneeX: 0, ankleX: 0, footX: 0, kneeLift: 0, ankleLift: 0, bodyBob: Math.sin(time * 0.0012) * 0.8, torsoLean: 0 };
  }

  /**
   * Talking.
   *
   * @param {number} side - Side.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static talk(side, time) {
    if (side > 0) {
      const b = Math.sin(time * 0.0048);
      return { armElbowX: 30, armElbowY: 21 + b * 4, armHandX: 25 + b * 5, armHandY: 1 + Math.cos(time * 0.0052) * 4, hipX: 0, kneeX: 0, ankleX: 0, footX: 0, kneeLift: 0, ankleLift: 0, bodyBob: Math.sin(time * 0.002) * 0.9, torsoLean: b * 0.4, headNod: Math.sin(time * 0.006) * 1.4 };
    }

    return { armElbowX: 12, armElbowY: 42, armHandX: 8, armHandY: 32, hipX: 0, kneeX: 0, ankleX: 0, footX: 0, kneeLift: 0, ankleLift: 0, bodyBob: 0, torsoLean: 0 };
  }

  /**
   * Point.
   *
   * @param {number} side - Side.
   * @returns {Object} Pose.
   */
  static point(side) {
    return side > 0
      ? { armElbowX: 34, armElbowY: 18, armHandX: 42, armHandY: 2, hipX: 0, kneeX: 0, ankleX: 0, footX: 0, kneeLift: 0, ankleLift: 0, bodyBob: 0, torsoLean: 1 }
      : this.idle(side, 0);
  }

  /**
   * Wave.
   *
   * @param {number} side - Side.
   * @param {number} time - Time.
   * @returns {Object} Pose.
   */
  static wave(side, time) {
    return side > 0
      ? { armElbowX: 24, armElbowY: -13, armHandX: 18 + Math.sin(time * 0.011) * 8, armHandY: -44, hipX: 0, kneeX: 0, ankleX: 0, footX: 0, kneeLift: 0, ankleLift: 0, bodyBob: 0, torsoLean: 0 }
      : this.idle(side, time);
  }

  /**
   * Throw windup.
   *
   * @param {number} side - Side.
   * @returns {Object} Pose.
   */
  static throwWindup(side) {
    return side > 0
      ? { armElbowX: 18, armElbowY: -32, armHandX: -12, armHandY: -34, hipX: 0, kneeX: 3, ankleX: 2, footX: 4, kneeLift: -1, ankleLift: 0, bodyBob: -1, torsoLean: -2 }
      : this.idle(side, 0);
  }

  /**
   * Throw release.
   *
   * @param {number} side - Side.
   * @returns {Object} Pose.
   */
  static throwRelease(side) {
    return side > 0
      ? { armElbowX: 34, armElbowY: -18, armHandX: 40, armHandY: -26, hipX: 0, kneeX: 3, ankleX: 2, footX: 4, kneeLift: -2, ankleLift: 0, bodyBob: -1, torsoLean: 3 }
      : this.idle(side, 0);
  }

  /**
   * Throw follow.
   *
   * @param {number} side - Side.
   * @returns {Object} Pose.
   */
  static throwFollow(side) {
    return side > 0
      ? { armElbowX: 30, armElbowY: 16, armHandX: 34, armHandY: 16, hipX: 0, kneeX: 2, ankleX: 1, footX: 3, kneeLift: 0, ankleLift: 0, bodyBob: 0, torsoLean: 2 }
      : this.idle(side, 0);
  }

  /**
   * Catch.
   *
   * @param {number} side - Side.
   * @returns {Object} Pose.
   */
  static catch(side) {
    return { armElbowX: 30, armElbowY: -5, armHandX: 28, armHandY: -14, hipX: 0, kneeX: 0, ankleX: 0, footX: 0, kneeLift: -3, ankleLift: 0, bodyBob: -2, torsoLean: -1 };
  }
}