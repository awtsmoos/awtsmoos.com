
// B"H
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

/**
 * @file ProfileSeed.js
 * @description
 * ============================================================================
 * CHAPTER: EACH SOUL RECEIVES A PRIVATE RHYTHM
 * ============================================================================
 *
 * Characters should not move like clones.
 * This file creates tiny deterministic variations from the id.
 *
 * The Awtsmoos creates each being with its own letters.
 * Here those letters become timing, sway, bounce, and stride.
 *
 * @class ProfileSeed
 */
export class ProfileSeed {
  /**
   * Builds deterministic seed data.
   *
   * @param {string} id - Character id.
   * @returns {Object} Seed package.
   */
  static fromId(id = 'soul') {
    const hash = AwtsmoosMath.hashString(id);
    const unit = (hash % 997) / 997;

    return {
      hash,
      unit,
      phase: unit * AwtsmoosMath.TAU,
      speedScale: 0.94 + (unit * 0.14),
      strideScale: 0.90 + (unit * 0.22),
      swingScale: 0.88 + (unit * 0.24),
      bounceScale: 0.90 + (unit * 0.20)
    };
  }
}
