
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @file SpeechHeadMotion.js
 * @description
 * CHAPTER: THE HEAD NODS TO THE WORD.
 *
 * Speech should not bulldoze the whole pose.
 * It should layer over the current state with a subtle natural nod,
 * a tiny sway, and viseme-based emphasis.
 */
export class SpeechHeadMotion {
  static visemeTiltBoost = {
    A: 0.55,
    E: 0.30,
    O: 0.45,
    T: 0.18,
    S: 0.22,
    M: 0.08
  };

  /**
   * Applies speech-driven head motion.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Real time.
   * @param {number} localTime - Speech-local time.
   * @param {Object} speechData - Speech analysis output.
   * @param {number} baseTilt - Resting head tilt.
   * @returns {void}
   */
  static apply(data, time, localTime, speechData, baseTilt) {
    const intensity = speechData.intensity || 0;
    const viseme = speechData.viseme || 'M';
    const nod = Math.sin((time * 0.0085) + (localTime * 0.021)) * intensity * 1.6;
    const sway = Math.sin((time * 0.0048) + (localTime * 0.011)) * intensity * 0.7;
    const emphasis = this.visemeTiltBoost[viseme] || 0.12;
    const target = baseTilt + nod + sway + (emphasis * intensity);

    const current = Number.isFinite(data.headTilt) ? data.headTilt : baseTilt;
    data.headTilt = AwtsmoosMath.lerp(current, target, 0.28);
  }

  /**
   * Relaxes the speech head motion back to rest.
   *
   * @param {Object} data - Character data.
   * @param {number} baseTilt - Resting head tilt.
   * @returns {void}
   */
  static relax(data, baseTilt) {
    const current = Number.isFinite(data.headTilt) ? data.headTilt : baseTilt;
    data.headTilt = AwtsmoosMath.lerp(current, baseTilt, 0.18);
  }
}
