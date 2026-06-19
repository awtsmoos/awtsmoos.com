
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @file AppearanceDiversityPass.js
 * @description
 * CHAPTER: THE CROWD RECEIVES MANY FACES.
 *
 * This pass fills in missing appearance traits without stomping on explicitly
 * chosen data. It gives the world more inviting variation: hair types,
 * hair colors, and default expression personalities.
 */
export class AppearanceDiversityPass {
  static hairTypes = [
    'standard',
    'wavy',
    'curly',
    'bob',
    'pixie',
    'shaggy',
    'wolf',
    'braided',
    'buzz',
    'pompadour',
    'spiky',
    'mohawk',
    'dreads',
    'mullet',
    'long'
  ];

  static hairColors = [
    '#111111',
    '#2a1b12',
    '#3b2416',
    '#5a3926',
    '#7d5435',
    '#a16d43',
    '#c48c54',
    '#d9b06f',
    '#6a2a1a'
  ];

  static expressions = [
    'neutral',
    'warm',
    'curious',
    'thinking',
    'heroic',
    'laughing',
    'concerned'
  ];

  /**
   * Applies deterministic visual diversity.
   *
   * @param {Object} data - Character data.
   * @returns {Object} The same character data, enriched.
   */
  static apply(data) {
    if (!data) return data;

    const id = String(data.id || 'soul');
    const seed = AwtsmoosMath.hashString(id);

    data.colors = data.colors || {};

    if (!data.hairType || data.hairType === 'default') {
      data.hairType = this.hairTypes[seed % this.hairTypes.length];
    }

    if (!data.colors.hair) {
      data.colors.hair = this.hairColors[seed % this.hairColors.length];
    }

    if (!data.expression) {
      data.expression = this.expressions[seed % this.expressions.length];
    }

    if (!data.view) data.view = 'threeQuarter';
    if (!data.mood) data.mood = 'calm';

    return data;
  }
}
