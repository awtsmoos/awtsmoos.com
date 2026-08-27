
// B"H
import { GaitProfileTable } from './GaitProfileTable.js';
import { ProfileMoodPicker } from './ProfileMoodPicker.js';
import { ProfileSeed } from './ProfileSeed.js';
import { GaitEmotionMixer } from './GaitEmotionMixer.js';

/**
 * @file StruttProfiles.js
 * @description
 * ============================================================================
 * CHAPTER: THE ESCAPED SYMBOLS ARE BURNED OUT
 * ============================================================================
 *
 * This file fixes the exact screenshot bug:
 * escaped operators inside JavaScript source were causing syntax failure.
 * There are real &&, real >, real <, and real arrow functions now.
 *
 * It is also split into smaller vessels:
 * GaitProfileTable, ProfileMoodPicker, ProfileSeed, GaitEmotionMixer.
 *
 * The Awtsmoos creates movement through order. The order is modular now.
 *
 * @class StruttProfiles
 */
export class StruttProfiles {
  static table = GaitProfileTable;

  /**
   * Resolves a locomotion profile from character data.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Expanded gait profile.
   */
  static resolve(data = {}) {
    const mood = ProfileMoodPicker.pick(data, this.table);
    const base = this.table[mood] || this.table.calm;
    const seed = ProfileSeed.fromId(data.id);
    const mixed = GaitEmotionMixer.mix(base, data, seed);

    return {
      ...mixed,
      mood
    };
  }
}
