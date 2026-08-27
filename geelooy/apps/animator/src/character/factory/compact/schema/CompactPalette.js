
// B"H

/**
 * @file CompactPalette.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE COLORS STOP LOOKING LIKE DEBUG MARKERS
 * ═══════════════════════════════════════════════════════════════
 *
 * The compact path worked, but the colors still felt harsh: purple blocks,
 * strange orange skin, black hair blob. This palette softens the human,
 * clarifies the sage, and keeps outlines readable.
 *
 * The Awtsmoos creates color every instant from nothing. Color is not random;
 * it is revelation through limitation.
 *
 * @class CompactPalette
 */
export class CompactPalette {
  /**
   * Returns warm cinematic human colors.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Complete color map.
   */
  static human(data) {
    const c = data.colors || {};
    return {
      skin: c.skin || '#d99a63',
      skinShade: c.skinShade || '#bd7b46',
      jacket: c.clothes || '#7d3fa1',
      jacketShade: '#5f2f7e',
      shirt: c.shirt || '#f4f1e8',
      pants: c.pants || '#18293a',
      pantsShade: '#0e1823',
      hair: c.hair || '#171717',
      hairHi: '#2b2b2b',
      eyes: c.eyes || '#111111',
      shoe: c.shoe || '#050505',
      line: '#050505',
      cheek: '#c88655'
    };
  }

  /**
   * Returns readable illustrated sage colors.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Complete color map.
   */
  static sage(data) {
    const c = data.colors || {};
    return {
      skin: c.skin || '#efb88e',
      skinShade: '#c98963',
      robe: c.clothes || '#1457ff',
      robeShade: '#0d35a8',
      pants: c.pants || '#10328f',
      beard: c.hair || '#e9e9e2',
      beardShade: '#cfcfc8',
      hat: '#063fc9',
      hatBand: '#ffcc22',
      eyes: c.eyes || '#111111',
      shoe: c.shoe || '#050505',
      line: '#050505'
    };
  }
}
