
// B"H
import { EmotionIconCatalog } from './EmotionIconCatalog.js';

/**
 * @file EmotionIconSelector.js
 * @description
 * CHAPTER: THE INNER STATE CHOOSES A SIGN.
 */
export class EmotionIconSelector {
  /**
   * Selects icons from character state.
   *
   * @param {Object} data - Character data.
   * @returns {Array<Object>} Icon configs.
   */
  static select(data = {}) {
    const chosen = [];
    const text = String(data.speech || '');

    this.pushIf(chosen, 'anger', data.stress || data.anger || 0);
    this.pushIf(chosen, 'sparkle', data.joy || 0);
    this.pushIf(chosen, 'heart', data.warmth || data.joy || 0);
    this.pushIf(chosen, 'shock', data.surprise || 0);

    if (text.includes('?')) chosen.push(EmotionIconCatalog.question);
    if (text.includes('!')) chosen.push(EmotionIconCatalog.exclaim);
    if ((data.stress || 0) > 0.35 && (data.surprise || 0) < 0.35) chosen.push(EmotionIconCatalog.sweat);

    return chosen.slice(0, 3);
  }

  /**
   * Pushes an icon if the value passes threshold.
   *
   * @param {Array<Object>} out - Output list.
   * @param {string} key - Catalog key.
   * @param {number} value - Emotion value.
   * @returns {void}
   */
  static pushIf(out, key, value) {
    const item = EmotionIconCatalog[key];
    if (item && value >= item.min) out.push(item);
  }
}
