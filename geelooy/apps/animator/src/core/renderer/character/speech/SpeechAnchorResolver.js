// B"H

/**
 * @file SpeechAnchorResolver.js
 * @description
 * Finds invisible speech anchors without drawing boxes around people.
 */
export class SpeechAnchorResolver {
  /**
   * Resolves anchors.
   *
   * @param {Object} character - Character data.
   * @returns {Object} Anchors.
   */
  static resolve(character = {}) {
    const p = character.position || {};
    const scale = Math.max(0.45, Number(p.scale || character.scale || 0.84));
    const x = Number(p.x || 0);
    const y = Number(p.y || 0);

    return {
      scale,
      root: { x, y },
      head: { x, y: y - 230 * scale, w: 86 * scale, h: 92 * scale },
      mouth: { x, y: y - 214 * scale },
      torso: { x, y: y - 132 * scale, w: 92 * scale, h: 120 * scale },
      preferred: { x, y: y - 330 * scale }
    };
  }
}