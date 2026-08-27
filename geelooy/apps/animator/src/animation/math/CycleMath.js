// B"H

/**
 * @file CycleMath.js
 * @description
 * ============================================================================
 * CHAPTER: THE LITTLE WHEEL THAT MADE MOTION OBEY
 * ============================================================================
 *
 * Motion without phase is chaos. This module gives all cyclic animation a tiny
 * clean math vessel: wrap, clamp, lerp, ease, sine, cosine, and phase distance.
 *
 * The Awtsmoos creates time from nothing every instant. This file only measures
 * the rhythm of that created instant so feet, hands, props, and heads stop
 * twitching like broken sparks.
 *
 * @class CycleMath
 */
export class CycleMath {
  /**
   * Clamps a value.
   *
   * @param {number} value - Input value.
   * @param {number} min - Minimum.
   * @param {number} max - Maximum.
   * @returns {number} Clamped value.
   */
  static clamp(value, min, max) {
    const n = Number.isFinite(value) ? value : min;
    return Math.max(min, Math.min(max, n));
  }

  /**
   * Wraps a number into 0..1.
   *
   * @param {number} value - Input value.
   * @returns {number} Wrapped phase.
   */
  static wrap01(value) {
    const v = Number.isFinite(value) ? value : 0;
    return ((v % 1) + 1) % 1;
  }

  /**
   * Linear interpolation.
   *
   * @param {number} a - Start.
   * @param {number} b - End.
   * @param {number} t - Amount.
   * @returns {number} Interpolated value.
   */
  static lerp(a, b, t) {
    return a + (b - a) * this.clamp(t, 0, 1);
  }

  /**
   * Smoothstep easing.
   *
   * @param {number} t - Raw progress.
   * @returns {number} Eased progress.
   */
  static smooth(t) {
    const x = this.clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  /**
   * Sine of normalized phase.
   *
   * @param {number} phase - Phase 0..1.
   * @returns {number} Sine wave.
   */
  static sin01(phase) {
    return Math.sin(this.wrap01(phase) * Math.PI * 2);
  }

  /**
   * Cosine of normalized phase.
   *
   * @param {number} phase - Phase 0..1.
   * @returns {number} Cosine wave.
   */
  static cos01(phase) {
    return Math.cos(this.wrap01(phase) * Math.PI * 2);
  }
}