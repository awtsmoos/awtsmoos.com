
// B"H
import { HumanProportionResolver } from './HumanProportions.js';
import { HumanFootPlantSolver } from './HumanFootPlantSolver.js';
import { HumanIKSolver } from './HumanIKSolver.js';

/**
 * @file HumanSkeletonFactory.js
 * @description
 * ============================================================================
 * CHAPTER: THE HUMAN FORM DESCENDED FROM ONE ROOT
 * ============================================================================
 *
 * One root. One pelvis. One spine. One head. Two arms. Two legs. No floating
 * head, no giant neck pillar, no detached hands, no missing feet. The skeleton
 * is born as one covenant, and every renderer must answer to it.
 *
 * @module HumanSkeletonFactory
 */

/**
 * @class HumanSkeletonFactory
 * @description
 * Creates a complete 2D human skeleton in screen/actor-plane coordinates.
 */
export class HumanSkeletonFactory {
  /**
   * Creates a skeleton for a character.
   *
   * @param {Object} character - Character data.
   * @param {Object} ctx - Render context.
   * @param {Object|null} state - App state.
   * @returns {Object} Joint map.
   */
  static create(character = {}, ctx = {}, state = null) {
    const p = HumanProportionResolver.resolve(character);
    const pos = character.position || {};
    const time = Number(character.realTime ?? character.time ?? performance.now());
    const perf = character.currentPerformance || {};
    const action = perf.locomotion || character.action || 'idle';
    const motion = character.motionProfileData || {};
    const facing = character.facing === 'left' ? -1 : 1;
    const baseX = Number(pos.x) || 0;
    const baseY = Number(pos.y) || 0;

    const leftStep = HumanFootPlantSolver.sample({ time, side: -1, motion, action });
    const rightStep = HumanFootPlantSolver.sample({ time, side: 1, motion, action });
    const bob = -Math.abs(Math.sin(time * 0.004)) * (action === 'idle' ? 1.2 : 4);
    const pelvis = { x: baseX, y: baseY + bob };
    const chest = { x: baseX + facing * Math.sin(time * 0.0015) * 2, y: pelvis.y - p.chestToPelvis };
    const neck = { x: chest.x, y: chest.y - p.chestToNeck };
    const head = { x: neck.x, y: neck.y - p.neck - p.headRadius };

    const skeleton = {
      root: { x: baseX, y: baseY },
      pelvis,
      spine: { x: (pelvis.x + chest.x) * 0.5, y: (pelvis.y + chest.y) * 0.5 },
      chest,
      neck,
      head,
      leftHip: { x: pelvis.x - p.hipHalf, y: pelvis.y },
      rightHip: { x: pelvis.x + p.hipHalf, y: pelvis.y },
      leftShoulder: { x: chest.x - p.shoulderHalf, y: chest.y - 8 },
      rightShoulder: { x: chest.x + p.shoulderHalf, y: chest.y - 8 }
    };

    this.solveLeg(skeleton, 'left', -1, leftStep, p);
    this.solveLeg(skeleton, 'right', 1, rightStep, p);
    this.solveArm(skeleton, 'left', -1, p, character, time);
    this.solveArm(skeleton, 'right', 1, p, character, time);

    skeleton.__meta = { proportions: p, action, facing, leftStep, rightStep };
    return skeleton;
  }

  /**
   * Solves one leg chain.
   *
   * @param {Object} s - Skeleton.
   * @param {string} name - left or right.
   * @param {number} side - -1 or 1.
   * @param {Object} step - Foot step data.
   * @param {Object} p - Proportions.
   * @returns {void}
   */
  static solveLeg(s, name, side, step, p) {
    const hip = s[name + 'Hip'];
    const footTarget = {
      x: hip.x + side * step.stride * 0.72 + side * p.foot * 0.2,
      y: s.root.y + p.thigh + p.shin - step.lift + p.footDrop
    };
    const solved = HumanIKSolver.solve(hip, footTarget, p.thigh, p.shin, side);
    s[name + 'Knee'] = { x: solved.mid.x, y: solved.mid.y - step.knee * 0.08 };
    s[name + 'Ankle'] = solved.end;
    s[name + 'Foot'] = { x: solved.end.x + side * p.foot * 0.5, y: solved.end.y + p.footDrop };
  }

  /**
   * Solves one arm chain.
   *
   * @param {Object} s - Skeleton.
   * @param {string} name - left or right.
   * @param {number} side - -1 or 1.
   * @param {Object} p - Proportions.
   * @param {Object} character - Character data.
   * @param {number} time - Render time.
   * @returns {void}
   */
  static solveArm(s, name, side, p, character, time) {
    const shoulder = s[name + 'Shoulder'];
    const gesture = character.gesture || character.currentPerformance?.gesture || 'none';
    const chosenSide = character.gestureSide === name || (!character.gestureSide && name === 'right');
    const wave = Math.sin(time * 0.011);
    let target = {
      x: shoulder.x + side * 26,
      y: shoulder.y + 76 + Math.sin(time * 0.002) * 3
    };

    if (chosenSide && gesture === 'wave') {
      target = { x: shoulder.x + side * (28 + wave * 10), y: shoulder.y - 48 };
    } else if (chosenSide && gesture === 'point') {
      target = { x: shoulder.x + side * 80, y: shoulder.y + 12 };
    } else if (chosenSide && gesture === 'explain') {
      target = { x: shoulder.x + side * (48 + Math.cos(time * 0.004) * 8), y: shoulder.y + 30 + Math.sin(time * 0.006) * 8 };
    }

    const solved = HumanIKSolver.solve(shoulder, target, p.upperArm, p.forearm, -side);
    s[name + 'Elbow'] = solved.mid;
    s[name + 'Wrist'] = solved.end;
    s[name + 'Hand'] = { x: solved.end.x + side * p.hand * 0.4, y: solved.end.y };
  }
}
