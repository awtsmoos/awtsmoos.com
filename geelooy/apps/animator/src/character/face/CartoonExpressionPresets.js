
// B"H

/**
 * @file CartoonExpressionPresets.js
 * @description
 * ============================================================================
 * CHAPTER: FACES THAT FEEL ALIVE
 * ============================================================================
 *
 * A living 2D character needs face variety:
 * curious, shocked, warm, annoyed, thinking, laughing, concerned, heroic.
 *
 * These are data presets, not tangled code.
 *
 * @class CartoonExpressionPresets
 */
export class CartoonExpressionPresets {
  static presets = {
    neutral: { joy: 0.1, sadness: 0.02, concentration: 0.15, stress: 0.02, surprise: 0.02, hate: 0 },
    curious: { joy: 0.08, sadness: 0.02, concentration: 0.72, stress: 0.12, surprise: 0.20, hate: 0 },
    shocked: { joy: 0.02, sadness: 0.03, concentration: 0.15, stress: 0.32, surprise: 0.85, hate: 0 },
    warm: { joy: 0.45, sadness: 0.02, concentration: 0.12, stress: 0.03, surprise: 0.05, hate: 0 },
    annoyed: { joy: 0.01, sadness: 0.04, concentration: 0.35, stress: 0.58, surprise: 0.06, hate: 0.22 },
    thinking: { joy: 0.05, sadness: 0.06, concentration: 0.88, stress: 0.12, surprise: 0.05, hate: 0 },
    laughing: { joy: 0.92, sadness: 0, concentration: 0.08, stress: 0.02, surprise: 0.18, hate: 0 },
    concerned: { joy: 0.02, sadness: 0.38, concentration: 0.46, stress: 0.42, surprise: 0.10, hate: 0 },
    heroic: { joy: 0.28, sadness: 0.02, concentration: 0.65, stress: 0.12, surprise: 0.12, hate: 0 }
  };

  /**
   * Gets expression preset by name.
   *
   * @param {string} key - Preset key.
   * @returns {Object} Preset.
   */
  static get(key) {
    return this.presets[key] || this.presets.neutral;
  }
}
