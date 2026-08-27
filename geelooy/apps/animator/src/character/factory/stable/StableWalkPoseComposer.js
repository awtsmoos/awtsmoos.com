// B"H
import { GaitClock } from '../../performance/gait/GaitClock.js';
import { WalkPhaseResolver } from '../../performance/gait/WalkPhaseResolver.js';
import { FootPlantSolver } from '../../performance/gait/FootPlantSolver.js';

/**
 * @file StableWalkPoseComposer.js
 * @description
 * Final compatibility walk composer. No private gait math remains here: the
 * file samples the authoritative performance gait system and returns the older
 * pose shape expected by stable renderers.
 */
export class StableWalkPoseComposer {
  /** @param {number} time @param {number} dir @param {Object} options @returns {Object} */
  static sample(time = 0, dir = 1, options = {}) {
    const raw = {
      _index: options.index || 0,
      motionMode: 'worldTravel',
      _travelProgress: Math.abs(time) <= 1 ? time : undefined,
      _travelDirection: dir
    };
    const state = { locomotion: { type: options.type || 'walk' }, raw };
    const clock = GaitClock.sample(time, state, raw);
    const leftInfo = WalkPhaseResolver.resolve(clock.left);
    const rightInfo = WalkPhaseResolver.resolve(clock.right);
    const stride = Number(options.stride || 34);
    const left = FootPlantSolver.solve(leftInfo, -1, dir, stride);
    const right = FootPlantSolver.solve(rightInfo, 1, dir, stride);

    return {
      action: options.type || 'walk',
      phase: clock.phase,
      phaseName: leftInfo.name,
      body: this.body(clock.phase, leftInfo, rightInfo, dir),
      legs: { left, right },
      arms: {
        left: this.arm(clock.phase, -1, dir),
        right: this.arm(clock.phase, 1, dir)
      }
    };
  }

  /** @param {number} phase @param {Object} left @param {Object} right @param {number} dir @returns {Object} */
  static body(phase, left, right, dir) {
    const wave = Math.sin(phase * Math.PI * 2);
    const planted = left.planted ? -1 : right.planted ? 1 : 0;
    return {
      bob: (left.lift + right.lift) * 0.08,
      torsoLean: dir * (1.4 + wave * 0.7),
      headNod: Math.cos(phase * Math.PI * 2) * 0.9,
      hipX: planted * 3.2,
      shoulderX: planted * -2.4,
      shoulderCounter: wave * 4.5,
      breath: wave * 0.5
    };
  }

  /** @param {number} phase @param {number} side @param {number} dir @returns {Object} */
  static arm(phase, side, dir) {
    const swing = Math.sin((phase + (side < 0 ? 0.5 : 0)) * Math.PI * 2);
    return {
      elbowX: 13 + swing * 15 * dir,
      elbowY: 36,
      handX: 8 + swing * 12 * dir,
      handY: 29,
      swing,
      shoulderLift: -Math.abs(swing) * 1.4
    };
  }
}
