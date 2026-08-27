// B"H

/**
 * @file StablePalette.js
 * @description
 * ============================================================================
 * CHAPTER: THE COLOR VESSEL
 * ============================================================================
 *
 * Palette is resolved once per character, then all stable renderers use it.
 *
 * @class StablePalette
 */
export class StablePalette {
  /**
   * Base.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Palette.
   */
  static base(data = {}) {
    const c = data.colors || {};
    return {
      line: c.line || '#111111',
      skin: c.skin || '#efb486',
      skinDark: c.skinDark || '#c77d5c',
      skinLight: c.skinLight || '#ffd6b2',
      blush: c.blush || 'rgba(255,112,117,0.30)',
      eye: c.eye || c.eyes || '#111111',
      eyeLight: c.eyeLight || '#ffffff',
      mouth: c.mouth || '#75252b',
      tooth: c.tooth || '#fff7e8',
      hair: c.hair || '#27150e',
      hairDark: c.hairDark || '#120806',
      jacket: c.jacket || c.clothes || c.suit || '#6f45c9',
      jacketDark: c.jacketDark || '#32195f',
      jacketLight: c.jacketLight || '#aa86f0',
      shirt: c.shirt || '#fff0d0',
      collar: c.collar || '#fff4dd',
      pants: c.pants || '#171927',
      pantsDark: c.pantsDark || '#080a10',
      shoe: c.shoe || '#0d0b0b',
      robe: c.robe || '#20283a',
      robeDark: c.robeDark || '#0e121d',
      robeLight: c.robeLight || '#404a64',
      sash: c.sash || '#b8913e',
      beard: c.beard || '#eee7dc',
      beardDark: c.beardDark || '#b7afa4'
    };
  }

  /**
   * Human.
   *
   * @param {Object} data - Data.
   * @returns {Object} Palette.
   */
  static human(data) {
    return this.base(data);
  }

  /**
   * Sage.
   *
   * @param {Object} data - Data.
   * @returns {Object} Palette.
   */
  static sage(data) {
    const p = this.base(data);
    return {
      ...p,
      hair: p.hair || '#eee7dc',
      hairDark: p.hairDark || '#bfb7aa'
    };
  }
}