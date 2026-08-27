
// B"H

/**
 * @file CompactColorSchema.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE COLORS RECEIVE THEIR LETTERS
 * ═══════════════════════════════════════════════════════════════
 *
 * Color chaos makes broken anatomy harder to diagnose. This schema gives every
 * compact body the same named vessels: skin, clothes, shirt, pants, hair,
 * beard, shoe, eyes, and line.
 *
 * The Awtsmoos recreates all color every instant from nothing. Here color is
 * not decoration; it is a diagnostic map of the body.
 *
 * @class CompactColorSchema
 */
export class CompactColorSchema {
  /**
   * Resolves human colors.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Resolved color object.
   */
  static human(data) {
    const c = data.colors || {};
    return {
      skin: c.skin || '#e0ac69',
      clothes: c.clothes || c.suit || '#8e44ad',
      shirt: c.shirt || '#ffffff',
      pants: c.pants || '#172838',
      hair: c.hair || '#111111',
      eyes: c.eyes || '#111111',
      shoe: c.shoe || '#050505',
      line: '#050505'
    };
  }

  /**
   * Resolves sage colors.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Resolved color object.
   */
  static sage(data) {
    const c = data.colors || {};
    return {
      skin: c.skin || '#f2c1a2',
      robe: c.clothes || '#0055ff',
      pants: c.pants || '#1133aa',
      beard: c.hair || '#eeeeee',
      hat: c.hat || '#0044cc',
      shoe: c.shoe || '#050505',
      eyes: c.eyes || '#111111',
      line: '#050505'
    };
  }
}
