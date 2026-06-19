
// B"H

/**
 * @file SpeechMouthMotion.js
 * @description
 * CHAPTER: THE MOUTH RECEIVES ITS MANY SHAPES.
 *
 * This layer stores realistic speech mouth overlays:
 * openness, width, roundness, cheek lift, and smile or grimace bias.
 */
export class SpeechMouthMotion {
  static visemeShapes = {
    A: { open: 1.10, width: 34, round: 0.08, smile: 0.02, grimace: 0.02, cheek: 0.05 },
    E: { open: 0.82, width: 36, round: 0.02, smile: 0.16, grimace: 0.03, cheek: 0.14 },
    O: { open: 0.95, width: 24, round: 0.58, smile: 0.01, grimace: 0.01, cheek: 0.04 },
    T: { open: 0.40, width: 28, round: 0.04, smile: 0.04, grimace: 0.08, cheek: 0.03 },
    S: { open: 0.48, width: 30, round: 0.06, smile: 0.03, grimace: 0.12, cheek: 0.03 },
    M: { open: 0.12, width: 26, round: 0.01, smile: 0.08, grimace: 0.01, cheek: 0.02 }
  };

  /**
   * Applies mouth overlays to speechFace storage.
   *
   * @param {Object} data - Character data.
   * @param {Object} speechData - Speech analysis output.
   * @param {string} text - Normalized speech text.
   * @returns {void}
   */
  static apply(data, speechData, text) {
    const viseme = speechData.viseme || 'M';
    const intensity = speechData.intensity || 0;
    const shape = this.visemeShapes[viseme] || this.visemeShapes.M;
    const smileHint = text.includes('!') ? 0.06 : 0.02;
    const concernHint = text.includes('?') ? 0.03 : 0;

    const prior = data.speechFace || {};
    data.speechFace = {
      ...prior,
      mouthOpen: shape.open * intensity,
      mouthWidth: shape.width + (intensity * 8),
      lipRound: shape.round * intensity,
      smileBias: shape.smile + smileHint,
      grimaceBias: shape.grimace + concernHint,
      cheekLift: shape.cheek * intensity
    };
  }
}
