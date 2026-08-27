
// B"H

/**
 * @file HumanRigProfileRegistry.js
 * @description
 * ============================================================================
 * CHAPTER: THE MEASURES OF MANY HUMAN VESSELS
 * ============================================================================
 *
 * A realistic cartoon body needs proportion, silhouette, and posture. These
 * profiles keep the renderer data-driven while preventing rectangle people.
 *
 * @module HumanRigProfileRegistry
 */

/**
 * @constant HUMAN_RIG_PROFILE_REGISTRY
 * @description
 * Body proportion profiles for direct-canvas rig rendering.
 */
export const HUMAN_RIG_PROFILE_REGISTRY = {
  averageAdult: {
    head: 28,
    neck: 14,
    torso: 92,
    shoulder: 48,
    waist: 32,
    hip: 42,
    upperArm: 44,
    forearm: 40,
    hand: 7,
    thigh: 58,
    shin: 58,
    foot: 32,
    posture: 0,
    coatFlare: 12
  },
  broadSpeaker: {
    head: 29,
    neck: 13,
    torso: 96,
    shoulder: 56,
    waist: 38,
    hip: 46,
    upperArm: 46,
    forearm: 42,
    hand: 8,
    thigh: 60,
    shin: 58,
    foot: 34,
    posture: -2,
    coatFlare: 16
  },
  gentleWalker: {
    head: 27,
    neck: 14,
    torso: 88,
    shoulder: 43,
    waist: 30,
    hip: 38,
    upperArm: 42,
    forearm: 38,
    hand: 7,
    thigh: 55,
    shin: 56,
    foot: 30,
    posture: 2,
    coatFlare: 10
  },
  heroicTall: {
    head: 27,
    neck: 15,
    torso: 104,
    shoulder: 60,
    waist: 36,
    hip: 44,
    upperArm: 50,
    forearm: 46,
    hand: 8,
    thigh: 66,
    shin: 66,
    foot: 36,
    posture: -4,
    coatFlare: 14
  }
};

/**
 * @class HumanRigProfileResolver
 * @description
 * Resolves body profile for a character.
 */
export class HumanRigProfileResolver {
  /**
   * Resolves scaled profile.
   *
   * @param {Object} character - Character data.
   * @param {number} scale - Screen scale.
   * @returns {Object} Profile.
   */
  static resolve(character = {}, scale = 1) {
    const key = character.bodyProfile || character.profile || 'averageAdult';
    const profile = HUMAN_RIG_PROFILE_REGISTRY[key] || HUMAN_RIG_PROFILE_REGISTRY.averageAdult;
    const out = {};
    for (const [k, v] of Object.entries(profile)) {
      out[k] = typeof v === 'number' ? v * scale : v;
    }
    out.scale = scale;
    return out;
  }
}
