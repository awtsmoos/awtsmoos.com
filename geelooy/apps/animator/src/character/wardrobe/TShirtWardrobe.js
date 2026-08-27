
// B"H

/**
 * @file TShirtWardrobe.js
 * @description
 * ============================================================================
 * CHAPTER: A THOUSAND SHIRTS IN A SMALL VESSEL
 * ============================================================================
 *
 * More T-shirts, more identity, more easy variety.
 * No escaped tags. No fake placeholder garments.
 *
 * The Awtsmoos creates fabric, pigment, light, and style from nothing every
 * instant. The shirt is simple, but simple can still shine.
 *
 * @class TShirtWardrobe
 */
export class TShirtWardrobe {
  static shirts = {
    plain_white: { id: 'plain_white', color: '#f7f4ec', trim: '#111111', print: null },
    bh_gold: { id: 'bh_gold', color: '#fff2b8', trim: '#332400', print: 'BH' },
    sky_blue: { id: 'sky_blue', color: '#80c7ff', trim: '#123047', print: null },
    forest_green: { id: 'forest_green', color: '#2faf6a', trim: '#06351c', print: null },
    midnight_star: { id: 'midnight_star', color: '#181b28', trim: '#eeeeee', print: 'STAR' },
    red_spark: { id: 'red_spark', color: '#d94a3d', trim: '#ffffff', print: '!' },
    purple_light: { id: 'purple_light', color: '#9b62d6', trim: '#21102e', print: null },
    coder_black: { id: 'coder_black', color: '#0a0a0a', trim: '#00ff99', print: 'CODE' },
    orange_sun: { id: 'orange_sun', color: '#ff9f2e', trim: '#5c2500', print: 'SUN' },
    ocean_wave: { id: 'ocean_wave', color: '#1fb6d8', trim: '#083a47', print: 'WAVE' },
    royal_blue: { id: 'royal_blue', color: '#2448ff', trim: '#ffffff', print: null },
    soft_pink: { id: 'soft_pink', color: '#ff9ac6', trim: '#55243a', print: null },
    lime_pop: { id: 'lime_pop', color: '#b6ff3d', trim: '#1d3b05', print: 'POP' },
    gray_city: { id: 'gray_city', color: '#9ca3af', trim: '#111827', print: null },
    cream_torah: { id: 'cream_torah', color: '#fff0cf', trim: '#5c3b12', print: 'TORAH' }
  };

  /**
   * Resolves shirt style.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Shirt data.
   */
  static resolve(data = {}) {
    const id = data.tshirt || data.tShirt || data.shirtStyle || 'plain_white';
    return this.shirts[id] || this.shirts.plain_white;
  }

  /**
   * Applies shirt colors to character data.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Same character data.
   */
  static apply(data = {}) {
    const shirt = this.resolve(data);
    data.colors = data.colors || {};
    data.colors.shirt = shirt.color;
    data.colors.shirtTrim = shirt.trim;
    data.tshirtPrint = shirt.print;
    data.tshirtName = shirt.id;
    return data;
  }
}
