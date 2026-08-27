
// B"H
import { EmotionIconSelector } from './EmotionIconSelector.js';
import { EmotionIconRenderer } from './EmotionIconRenderer.js';

/**
 * @file CharacterEmotionVFX.js
 * @description
 * CHAPTER: CARTOON EMOTION BECOMES REAL OBJECTS.
 */
export class CharacterEmotionVFX {
  /**
   * Builds emotion VFX objects for one character.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Array<Object>} VirtualGraph nodes.
   */
  static build(data, time) {
    if (!data) return [];
    const icons = EmotionIconSelector.select(data);
    return icons.map((icon, index) => EmotionIconRenderer.build(icon, data, index, time));
  }
}
