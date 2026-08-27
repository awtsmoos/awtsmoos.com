
// B"H
import { VisemeLibrary } from '../../../core/animation/systems/vocal/VisemeLibrary.js';

/**
 * @file SpeechKinetics.js
 * @description
 * ============================================================================
 * CHAPTER: THE ALCHEMY OF SOUND BECOMES REALER
 * ============================================================================
 *
 * Speech now has attack, sustain, release, punctuation pauses, intensity,
 * and richer viseme shapes. It still outputs a simple object for the
 * existing mouth pipeline.
 */
export class SpeechKinetics {
  /**
   * Analyzes text at a local speech time.
   *
   * @param {string} text - Speech text.
   * @param {number} actionTime - Local speech time.
   * @returns {Object} Speech analysis.
   */
  static analyze(text, actionTime) {
    if (!text || text.length === 0) {
      return this.silent();
    }

    const clean = String(text);
    const chars = clean.split('');
    const timePerChar = 62;
    const totalDuration = chars.length * timePerChar + 280;

    if (actionTime > totalDuration) {
      return this.silent();
    }

    const rawIndex = Math.floor(actionTime / timePerChar);
    const charIndex = Math.max(0, Math.min(chars.length - 1, rawIndex));
    const char = chars[charIndex] || 'M';

    if (char === ' ' || char === ',' || char === '.') {
      return { intensity: 0.08, viseme: 'M', attack: 0, char, shape: VisemeLibrary.shape('M') };
    }

    if (char === '!' || char === '?') {
      return { intensity: 0.34, viseme: 'A', attack: 0.55, char, shape: VisemeLibrary.shape('A') };
    }

    const viseme = VisemeLibrary.visemeForChar(char);
    const shape = VisemeLibrary.shape(viseme);
    const inChar = actionTime % timePerChar;
    const attack = inChar < 16 ? inChar / 16 : 1;
    const release = inChar > 45 ? Math.max(0.25, 1 - ((inChar - 45) / 17)) : 1;
    const chatter = Math.sin(actionTime * 0.08) * 0.08;
    const intensity = Math.max(0.05, Math.min(1.45, shape.intensity * attack * release + chatter));

    return {
      intensity,
      viseme,
      attack,
      char,
      shape
    };
  }

  /**
   * Returns silence.
   *
   * @returns {Object} Silent speech analysis.
   */
  static silent() {
    return {
      intensity: 0,
      viseme: 'M',
      attack: 0,
      char: '',
      shape: VisemeLibrary.shape('M')
    };
  }
}
