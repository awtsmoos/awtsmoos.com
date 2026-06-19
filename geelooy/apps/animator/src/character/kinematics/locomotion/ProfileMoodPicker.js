
// B"H

/**
 * @file ProfileMoodPicker.js
 * @description
 * ============================================================================
 * CHAPTER: THE MOOD CHOOSES THE WALK
 * ============================================================================
 *
 * No escaped operators.
 * No giant file.
 * One small vessel: choose the motion mood.
 *
 * The Awtsmoos creates inner states and outer steps. Rage stomps, joy bounces,
 * calm flows, sadness drags, thought leans inward.
 *
 * @class ProfileMoodPicker
 */
export class ProfileMoodPicker {
  /**
   * Picks a mood key from character data.
   *
   * @param {Object} data - Character data.
   * @param {Object} table - Available profile table.
   * @returns {string} Mood key.
   */
  static pick(data = {}, table = {}) {
    if (data.mood && table[data.mood]) return data.mood;
    if ((data.anger || 0) > 0.6) return 'furious';
    if ((data.joy || 0) > 0.6) return 'euphoric';
    if ((data.sadness || 0) > 0.6) return 'melancholic';
    if ((data.concentration || 0) > 0.5) return 'thoughtful';
    if (data.isTalking) return 'warm';
    return 'calm';
  }
}
