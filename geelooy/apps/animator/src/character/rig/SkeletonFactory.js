// B"H
import { BodyProportions } from './BodyProportions.js';

/**
 * @file SkeletonFactory.js
 * @description
 * Creates connected joint anchors for every character. Renderers ask this
 * skeleton where shoulders, hips, neck, knees, wrists, and feet are.
 */
export class SkeletonFactory {
  /**
   * Creates skeleton.
   *
   * @param {Object} data - Character data.
   * @param {Object} m - Metrics.
   * @param {Object} view - View profile.
   * @param {Object} pose - Whole body pose.
   * @returns {Object} Skeleton.
   */
  static create(data, m, view, pose) {
    const p = BodyProportions.get(data.bodyProfile || (data.archetype === 'sage' ? 'sage' : 'friendlyAverage'));
    const dir = view.dir || 1;
    const hipShift = pose.body?.hipX || 0;
    const shoulderShift = pose.body?.shoulderX || 0;
    const torsoLean = pose.body?.torsoLean || 0;

    const root = { x: 0, y: 0 };
    const hips = { x: hipShift * 0.35, y: m.hipY };
    const chest = { x: shoulderShift * 0.4 + torsoLean * 0.3, y: m.chestY };
    const neck = { x: chest.x + view.torso.centerX * 0.18, y: m.neckTopY };
    const head = { x: neck.x + view.head.offsetX, y: m.headY + (pose.body?.headNod || 0) };

    const shoulderHalf = m.shoulderHalf * p.shoulder * view.torso.scaleX;
    const hipHalf = m.hipHalf * p.hip * view.limbs.sideSpread;

    return {
      root,
      hips,
      chest,
      neck,
      head,
      leftShoulder: { x: chest.x - shoulderHalf + view.torso.farShoulderPull, y: m.shoulderY },
      rightShoulder: { x: chest.x + shoulderHalf + view.torso.nearShoulderPush, y: m.shoulderY },
      leftHip: { x: hips.x - hipHalf, y: m.hipY },
      rightHip: { x: hips.x + hipHalf, y: m.hipY },
      dir,
      proportions: p,
      view,
      pose
    };
  }

  /**
   * Gets side joint.
   *
   * @param {Object} skeleton - Skeleton.
   * @param {string} name - Joint base name.
   * @param {number} side - -1 or 1.
   * @returns {Object} Joint.
   */
  static side(skeleton, name, side) {
    const key = `${side < 0 ? 'left' : 'right'}${name}`;
    return skeleton[key];
  }
}