
// B"H

/**
 * @file VisemeLibrary.js
 * @description
 * ============================================================================
 * CHAPTER: THE MOUTH RECEIVES MANY GATES
 * ============================================================================
 *
 * This table maps letters to richer mouth shapes so talking feels more alive.
 * It feeds the existing MouthEngine through targetViseme, vocalIntensity,
 * mouthWidth, mouthOpen, cheek lift, and expression overlays.
 */
export class VisemeLibrary {
  static letterMap = {
    A: 'A',
    E: 'E',
    I: 'E',
    O: 'O',
    U: 'O',
    W: 'O',
    Q: 'O',
    M: 'M',
    B: 'M',
    P: 'M',
    T: 'T',
    D: 'T',
    N: 'T',
    L: 'T',
    R: 'T',
    S: 'S',
    Z: 'S',
    C: 'S',
    X: 'S',
    F: 'E',
    V: 'E',
    H: 'A',
    Y: 'E',
    K: 'A',
    G: 'A',
    J: 'E'
  };

  static shapeMap = {
    A: { intensity: 1.20, open: 1.12, width: 36, cheek: 0.08, smile: 0.02, grimace: 0.00 },
    E: { intensity: 0.94, open: 0.70, width: 40, cheek: 0.18, smile: 0.16, grimace: 0.02 },
    O: { intensity: 1.05, open: 0.98, width: 24, cheek: 0.06, smile: 0.00, grimace: 0.00 },
    T: { intensity: 0.72, open: 0.42, width: 30, cheek: 0.04, smile: 0.04, grimace: 0.08 },
    S: { intensity: 0.78, open: 0.34, width: 34, cheek: 0.04, smile: 0.02, grimace: 0.16 },
    M: { intensity: 0.20, open: 0.08, width: 28, cheek: 0.03, smile: 0.06, grimace: 0.00 }
  };

  /**
   * Resolves a character to a viseme key.
   *
   * @param {string} char - Single character.
   * @returns {string} Viseme key.
   */
  static visemeForChar(char) {
    const key = String(char || 'M').toUpperCase();
    return this.letterMap[key] || 'E';
  }

  /**
   * Gets shape information for a viseme.
   *
   * @param {string} viseme - Viseme key.
   * @returns {Object} Shape info.
   */
  static shape(viseme) {
    return this.shapeMap[viseme] || this.shapeMap.M;
  }
}
