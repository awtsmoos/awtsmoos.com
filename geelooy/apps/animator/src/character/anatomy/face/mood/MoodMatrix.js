
// B"H
/**
 * @file MoodMatrix.js
 * @description
 * 
 * ============================================================================
 * CHAPTER 19: THE MATRIX OF THE HEART (Tavnit HaLev)
 * ============================================================================
 * To say a character is "sad" and merely pull down the corners of their mouth 
 * is a lie. Sadness affects the entire body. The breathing slows. The blink rate 
 * alters. The eyes twitch differently.
 * 
 * THE POEM OF THE MOODS:
 * We map the soul, we map the heart,
 * A hyper-real and living art!
 * A furious mind will breathe so fast,
 * With rapid blinks that will not last.
 * A calm demeanor, slow and deep,
 * Before the digital falls asleep.
 * We blend the values, perfectly bound,
 * Into the most expressive system found!
 * 
 * @class MoodMatrix
 * @classdesc Translates high-level string moods into microscopic biological offsets.
 * ============================================================================
 */

export class MoodMatrix {
  /**
   * @description Data dictionary of biological baselines.
   */
  static Matrices = {
    calm: {
      breathFreq: 0.0015,
      breathAmp: 0.015,
      blinkDelayBase: 300, // Frames between blinks
      headSwayAmp: 2.5,
      eyeDartChance: 0.1 // 10% chance per tick
    },
    furious: {
      breathFreq: 0.005, // Rapid, shallow breathing
      breathAmp: 0.025,
      blinkDelayBase: 100, // Frequent nervous blinking
      headSwayAmp: 0.5, // Tense, locked neck
      eyeDartChance: 0.6 // Erratic focus
    },
    melancholic: {
      breathFreq: 0.001, // Slow, heavy sighs
      breathAmp: 0.03,
      blinkDelayBase: 500, // Long stares into the void
      headSwayAmp: 4.0, // Drooping, heavy sway
      eyeDartChance: 0.05
    },
    euphoric: {
      breathFreq: 0.003,
      breathAmp: 0.02,
      blinkDelayBase: 200,
      headSwayAmp: 5.0, // Bouncy, energetic head movements
      eyeDartChance: 0.4
    }
  };

  /**
   * @function evaluate
   * @description Injects the biological modifiers into the character's core state.
   */
  static evaluate(data) {
    const mood = data.mood || 'calm';
    const matrix = this.Matrices[mood] || this.Matrices.calm;

    // Apply the biological baseline to the data object so the engine can read it
    data.bioMetrics = {
      ...matrix,
      // Introduce slight deterministic randomness based on character ID so they aren't clones
      blinkDelayBase: matrix.blinkDelayBase + (data.id.length * 10)
    };

    return data.bioMetrics;
  }
}
