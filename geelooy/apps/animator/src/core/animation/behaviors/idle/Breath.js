/* B"H */
/**
 * @file Breath.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE BREATH OF LIFE (Nishmat Chaim)
 * THE BROKEN PATH RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * THE POEM OF THE LOST IMPORT:
 * The import path climbed five floors too high,
 * Past src/, past the project, into the void of the sky!
 * Five dots of '../' when only four were needed,
 * The AnimationRegistry — lost! Its signal unheeded!
 * Now four levels ascend from the idle/ depth,
 * And the Registry breathes its first corrected breath.
 *
 * PATH RESOLUTION (FIXED):
 * File location: src/core/animation/behaviors/idle/Breath.js
 * Target:        src/animation/data/AnimationRegistry.js
 * Relative path: ../../../../animation/data/AnimationRegistry.js
 *                (idle/ → behaviors/ → animation/ → core/ → src/ → animation/)
 *                That is 4 levels up, then down into animation/data/
 *
 * @module BreathBehavior
 */

// B"H - RECTIFICATION: Corrected from '../../../../../' to '../../../../'
import { ANIMATION_REGISTRY } from '../../../../animation/data/AnimationRegistry.js';

/**
 * @class BreathBehavior
 * @description
 * Computes the sine-wave chest rise amplitude for a character based on
 * their current mood. The output drives the torso scale and shoulder
 * height in the main render loop.
 *
 * "And He breathed into his nostrils the breath of life" — Bereishis 2:7
 * This class IS that breath, translated into a mathematical oscillation.
 */
export class BreathBehavior {
  /**
   * @function calculate
   * @description
   * Returns the current breath amplitude — a value from 0 to ~0.08 —
   * based on the character's mood and the current animation time.
   *
   * @param {number} time - The current animation timestamp in milliseconds.
   * @param {string} mood - The character's emotional state (e.g., 'calm', 'energetic').
   * @returns {number} A scalar breath amplitude for torso scaling.
   */
  static calculate(time, mood = 'calm') {
    // Fetch the mood's configuration from the central registry.
    // Falls back to 'calm' if the mood is not yet registered.
    const moodConfig = ANIMATION_REGISTRY.idle[mood] || ANIMATION_REGISTRY.idle.calm;

    // Base speed and amplitude from the registry
    let speed     = moodConfig.breathFreq || 0.002;
    let amplitude = moodConfig.breathFreq ? (moodConfig.breathFreq * 0.15) : 0.03;

    // B"H - Mood overrides for states not yet in the registry
    if (mood === 'energetic') { speed = 0.005; amplitude = 0.05; }
    if (mood === 'nervous')   { speed = 0.008; amplitude = 0.02; }
    if (mood === 'happy')     { speed = 0.003; amplitude = 0.04; }

    return (Math.sin(time * speed) + 1) * amplitude;
  }
}