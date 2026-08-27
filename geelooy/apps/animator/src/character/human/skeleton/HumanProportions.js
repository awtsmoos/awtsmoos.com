
// B"H

/**
 * @file HumanProportions.js
 * @description
 * ============================================================================
 * CHAPTER: THE MEASURE THAT PREVENTED THE GIANT NECK
 * ============================================================================
 *
 * Broken humans come from broken measures. This registry gives every skeleton
 * a single covenant of lengths: head radius, neck, torso, arms, legs, feet,
 * shoulders, and hips. The renderer may stylize, but it must not invent chaos.
 *
 * @module HumanProportions
 */

/**
 * @constant HUMAN_PROPORTIONS
 * @description
 * Reusable 2D body proportion profiles.
 */
export const HUMAN_PROPORTIONS = {
  averageAdult: {
    scale: 1,
    headRadius: 28,
    neck: 12,
    shoulderHalf: 35,
    chestToPelvis: 88,
    chestToNeck: 36,
    hipHalf: 23,
    upperArm: 44,
    forearm: 38,
    hand: 10,
    thigh: 70,
    shin: 66,
    foot: 30,
    footDrop: 7
  },
  broadSpeaker: {
    scale: 1,
    headRadius: 29,
    neck: 11,
    shoulderHalf: 40,
    chestToPelvis: 90,
    chestToNeck: 37,
    hipHalf: 25,
    upperArm: 46,
    forearm: 40,
    hand: 11,
    thigh: 71,
    shin: 67,
    foot: 31,
    footDrop: 7
  },
  gentleWalker: {
    scale: 1,
    headRadius: 27,
    neck: 12,
    shoulderHalf: 32,
    chestToPelvis: 84,
    chestToNeck: 35,
    hipHalf: 21,
    upperArm: 41,
    forearm: 36,
    hand: 10,
    thigh: 66,
    shin: 64,
    foot: 27,
    footDrop: 6
  },
  bikeRider: {
    scale: 1,
    headRadius: 27,
    neck: 11,
    shoulderHalf: 34,
    chestToPelvis: 82,
    chestToNeck: 34,
    hipHalf: 22,
    upperArm: 42,
    forearm: 37,
    hand: 10,
    thigh: 68,
    shin: 65,
    foot: 29,
    footDrop: 6
  }
};

/**
 * @class HumanProportionResolver
 * @description
 * Resolves proportion profiles with scaling.
 */
export class HumanProportionResolver {
  /**
   * Resolves one profile.
   *
   * @param {Object} character - Character data.
   * @returns {Object} Proportion data.
   */
  static resolve(character = {}) {
    const profile = HUMAN_PROPORTIONS[character.bodyProfile] || HUMAN_PROPORTIONS.averageAdult;
    const scale = Math.max(0.2, Number(character.scale) || profile.scale || 1);
    const out = {};

    for (const [key, value] of Object.entries(profile)) {
      out[key] = typeof value === 'number' ? value * scale : value;
    }

    out.scale = scale;
    return out;
  }
}
