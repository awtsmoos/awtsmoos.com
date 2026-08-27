
// B"H
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @file AnimationPersonality.js
 * @description
 * ============================================================================
 * CHAPTER: NO TWO SOULS MOVE THE SAME
 * ============================================================================
 *
 * This module gives every character a deterministic animation personality:
 * timing, exaggeration, posture, bounce, blink flavor, gesture flavor,
 * camera-facing bias, and emotional intensity.
 *
 * The Awtsmoos creates each being with its own letters. Those letters now
 * become different motion timing, different facial rhythm, different energy,
 * different body language, and a more anime-cartoon-real feeling.
 */
export class AnimationPersonality {
  static archetypes = [
    'gentle',
    'nervous',
    'heroic',
    'sleepy',
    'bouncy',
    'dramatic',
    'grounded',
    'curious',
    'fiery',
    'calm'
  ];

  /**
   * Resolves personality from character id and data.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Personality.
   */
  static resolve(data = {}) {
    const id = String(data.id || 'soul');
    const hash = AwtsmoosMath.hashString(id);
    const unit = (hash % 1000) / 1000;
    const archetype = data.animationPersonality || this.archetypes[hash % this.archetypes.length];

    const base = this.base(archetype);

    return {
      ...base,
      archetype,
      seed: hash,
      unit,
      phase: unit * AwtsmoosMath.TAU,
      blinkOffset: (hash % 431) * 13,
      gestureOffset: (hash % 257) * 17,
      motionOffset: (hash % 701) * 11,
      asymmetry: -1 + unit * 2,
      speedScale: base.speedScale * (0.92 + unit * 0.18),
      bounceScale: base.bounceScale * (0.90 + unit * 0.26),
      expressionScale: base.expressionScale * (0.86 + unit * 0.32),
      hairMotionScale: base.hairMotionScale * (0.88 + unit * 0.28)
    };
  }

  /**
   * Returns base settings for a personality archetype.
   *
   * @param {string} key - Personality key.
   * @returns {Object} Base personality.
   */
  static base(key) {
    const table = {
      gentle: { speedScale: 0.92, bounceScale: 0.70, expressionScale: 0.82, hairMotionScale: 0.85, posture: 0.10 },
      nervous: { speedScale: 1.18, bounceScale: 0.95, expressionScale: 1.30, hairMotionScale: 1.12, posture: -0.05 },
      heroic: { speedScale: 1.06, bounceScale: 1.25, expressionScale: 1.10, hairMotionScale: 1.18, posture: 0.32 },
      sleepy: { speedScale: 0.74, bounceScale: 0.45, expressionScale: 0.65, hairMotionScale: 0.62, posture: -0.22 },
      bouncy: { speedScale: 1.12, bounceScale: 1.55, expressionScale: 1.18, hairMotionScale: 1.35, posture: 0.16 },
      dramatic: { speedScale: 1.00, bounceScale: 1.20, expressionScale: 1.55, hairMotionScale: 1.30, posture: 0.08 },
      grounded: { speedScale: 0.88, bounceScale: 0.55, expressionScale: 0.88, hairMotionScale: 0.75, posture: 0.02 },
      curious: { speedScale: 1.02, bounceScale: 0.90, expressionScale: 1.28, hairMotionScale: 1.05, posture: 0.00 },
      fiery: { speedScale: 1.24, bounceScale: 1.10, expressionScale: 1.42, hairMotionScale: 1.24, posture: 0.12 },
      calm: { speedScale: 0.96, bounceScale: 0.78, expressionScale: 0.90, hairMotionScale: 0.88, posture: 0.05 }
    };

    return table[key] || table.calm;
  }
}
