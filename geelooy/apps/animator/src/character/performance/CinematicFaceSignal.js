// B"H

/**
 * @file CinematicFaceSignal.js
 * @description
 * A small adapter that connects speech, emotion, blink, brow, and camera detail
 * into one stable signal the current renderer can actually consume.
 */
export class CinematicFaceSignal {
  /**
   * Computes visible face signal.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Face signal.
   */
  static from(data = {}) {
    const t = Number(data._directorTime || data._renderTime || 0);
    const talking = Boolean(data.isTalking || data.speech);
    const speechText = String(data.speech || '');
    const energy = Math.max(0, Math.min(1, Number(data.speechEnergy ?? 0.72)));
    const syllables = Math.max(1, Math.min(8, speechText.split(/\s+/).filter(Boolean).length));
    const speechPhase = ((Number(data.speechLocalTime || 0) / 1000) * (2.2 + syllables * 0.18)) % 1;
    const rawWave = 0.5 - 0.5 * Math.cos(speechPhase * Math.PI * 2);
    const consonantRest = Math.sin(speechPhase * Math.PI * 6) > 0.72 ? 0.38 : 1;
    const mouthWave = rawWave * consonantRest;
    const blink = this.blink(t, data.id || 'x');
    const emotion = data.emotion || 'calm';

    return {
      talking,
      mouthOpen: talking ? Math.min(0.42, 0.045 + mouthWave * 0.38 * energy) : 0.02,
      mouthSmile: /happy|excited|pleased/.test(emotion) ? 0.38 : /worried|sad/.test(emotion) ? -0.16 : 0.12,
      browOuter: /surprised|excited/.test(emotion) ? 0.32 : /worried|focused/.test(emotion) ? -0.18 : 0.02,
      browInner: talking ? 0.12 * Math.sin(speechPhase * Math.PI * 2) : 0,
      eyeOpen: blink,
      eyeFocus: data.lookAt || null
    };
  }

  /**
   * Deterministic blink value.
   *
   * @param {number} t - Time.
   * @param {string} seed - Id seed.
   * @returns {number} Eye openness.
   */
  static blink(t, seed) {
    const n = [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0) % 997;
    const phase = ((t + n * 13) % 3600) / 3600;
    if (phase < 0.018) return 0.12;
    if (phase < 0.035) return 0.55;
    return 1;
  }
}
