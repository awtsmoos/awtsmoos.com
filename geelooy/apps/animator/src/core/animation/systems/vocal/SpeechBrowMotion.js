
// B"H

/**
 * @file SpeechBrowMotion.js
 * @description
 * CHAPTER: THE BROWS LISTEN AND RESPOND.
 *
 * Brows carry invitation, curiosity, emphasis, and tension.
 * This module stores speech-specific overlay data for the face layer.
 */
export class SpeechBrowMotion {
  static profileTable = {
    A: { questionLift: 0.06, browPinch: 0.03, warmth: 0.04, squintBias: 0.02 },
    E: { questionLift: 0.08, browPinch: 0.02, warmth: 0.05, squintBias: 0.04 },
    O: { questionLift: 0.14, browPinch: 0.01, warmth: 0.03, squintBias: 0.01 },
    T: { questionLift: 0.04, browPinch: 0.05, warmth: 0.01, squintBias: 0.06 },
    S: { questionLift: 0.03, browPinch: 0.08, warmth: 0.01, squintBias: 0.08 },
    M: { questionLift: 0.02, browPinch: 0.01, warmth: 0.06, squintBias: 0.02 }
  };

  /**
   * Applies brow overlays to speechFace storage.
   *
   * @param {Object} data - Character data.
   * @param {Object} speechData - Speech analysis output.
   * @param {string} text - Normalized speech text.
   * @param {number} localTime - Speech-local time.
   * @returns {void}
   */
  static apply(data, speechData, text, localTime) {
    const viseme = speechData.viseme || 'M';
    const base = this.profileTable[viseme] || this.profileTable.M;
    const questionLift = text.includes('?') ? 0.22 : 0;
    const exclaimPinch = text.includes('!') ? 0.18 : 0;
    const pulse = (speechData.intensity || 0) * 0.9;

    const prior = data.speechFace || {};
    data.speechFace = {
      ...prior,
      localPhase: localTime * 0.01,
      browRhythm: pulse,
      questionLift: base.questionLift + questionLift,
      browPinch: base.browPinch + exclaimPinch,
      warmth: base.warmth,
      squintBias: base.squintBias * (speechData.intensity || 0)
    };
  }
}
