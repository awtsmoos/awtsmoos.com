
// B"H

/**
 * @file SceneCharacterDefaults.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE HUMBLE DEFAULTS OF THE BODY
 * ═══════════════════════════════════════════════════════════════
 *
 * Scene JSON is allowed to be poetic. Rendering code is not allowed to be
 * confused. A character can say "human" or "sage", "realistic" or
 * "illustrated_sage", but before anatomy begins, the defaults must become
 * explicit.
 *
 * This module never hides missing fields behind chaos. It gives complete
 * render defaults in one place.
 *
 * The Awtsmoos creates every stone with exact letters. So too each character
 * receives exact defaults before being clothed in geometry.
 *
 * @class SceneCharacterDefaults
 */
export class SceneCharacterDefaults {
  /**
   * Returns a complete render-ready character data object.
   *
   * @param {Object} data - Raw character data.
   * @returns {Object} Character data with safe defaults.
   */
  static apply(data) {
    const base = data || {};
    const colors = base.colors || {};

    return {
      ...base,
      id: base.id || 'soul_without_id',
      archetype: base.archetype || 'human',
      style: base.style || 'realistic',
      view: base.view || 'front',
      flipX: Boolean(base.flipX),
      mood: base.mood || 'calm',
      hairType: base.hairType || 'standard',
      shoeType: base.shoeType || 'boots',
      colors: {
        skin: colors.skin || '#f2c1a2',
        clothes: colors.clothes || colors.suit || '#333333',
        pants: colors.pants || '#1b2430',
        hair: colors.hair || '#222222',
        eyes: colors.eyes || '#28190f',
        ...colors
      },
      position: {
        x: Number.isFinite(base.position?.x) ? base.position.x : 0,
        y: Number.isFinite(base.position?.y) ? base.position.y : 0,
        scale: Number.isFinite(base.position?.scale) ? base.position.scale : 1
      }
    };
  }
}
