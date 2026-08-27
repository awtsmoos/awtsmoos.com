
// B"H

/**
 * @file AwtsmoosMath.js
 * @description
 * ============================================================================
 * CHAPTER: THE COLOR OF THE SKY RETURNS
 * ============================================================================
 *
 * The render loop crashed because SkyGradientBuilder calls
 * AwtsmoosMath.lerpColor, and the prior rewrite removed that method.
 *
 * This file restores lerpColor and keeps every operator as real JavaScript.
 * No escaped operators. No broken source. No vanished sky.
 *
 * The Awtsmoos creates number, color, curve, breath, and gradient from nothing
 * every instant. This vessel gives the engine stable math again.
 */
export class AwtsmoosMath {
  static PI = Math.PI;
  static TAU = Math.PI * 2;
  static HALF_PI = Math.PI / 2;

  static Easing = {
    easeOutQuad(t) {
      const x = AwtsmoosMath.clamp(t, 0, 1);
      return 1 - ((1 - x) * (1 - x));
    },

    easeInOutSine(t) {
      const x = AwtsmoosMath.clamp(t, 0, 1);
      return -(Math.cos(Math.PI * x) - 1) / 2;
    },

    easeInOutCubic(t) {
      const x = AwtsmoosMath.clamp(t, 0, 1);
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    },

    easeOutBack(t) {
      const x = AwtsmoosMath.clamp(t, 0, 1);
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },

    easeOutElastic(t) {
      const x = AwtsmoosMath.clamp(t, 0, 1);
      if (x === 0) return 0;
      if (x === 1) return 1;
      const c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }
  };

  /**
   * Clamps a value.
   *
   * @param {number} value - Value.
   * @param {number} min - Minimum.
   * @param {number} max - Maximum.
   * @returns {number} Clamped value.
   */
  static clamp(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation.
   *
   * @param {number} a - Start.
   * @param {number} b - End.
   * @param {number} t - Ratio.
   * @returns {number} Interpolated value.
   */
  static lerp(a, b, t) {
    const x = this.clamp(t, 0, 1);
    return a + (b - a) * x;
  }

  /**
   * Parses a hex color into RGB.
   *
   * @param {string} hex - Hex color.
   * @returns {{r:number,g:number,b:number}} RGB channels.
   */
  static parseHexColor(hex) {
    const safe = String(hex || '#000000').replace('#', '').trim();
    const normalized = safe.length === 3
      ? safe.split('').map(ch => ch + ch).join('')
      : safe.padEnd(6, '0').slice(0, 6);

    return {
      r: parseInt(normalized.slice(0, 2), 16) || 0,
      g: parseInt(normalized.slice(2, 4), 16) || 0,
      b: parseInt(normalized.slice(4, 6), 16) || 0
    };
  }

  /**
   * Converts RGB channels to a hex color.
   *
   * @param {number} r - Red.
   * @param {number} g - Green.
   * @param {number} b - Blue.
   * @returns {string} Hex color.
   */
  static rgbToHex(r, g, b) {
    const toHex = value => this.clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Interpolates between two hex colors.
   *
   * @param {string} colorA - First color.
   * @param {string} colorB - Second color.
   * @param {number} t - Ratio.
   * @returns {string} Interpolated hex color.
   */
  static lerpColor(colorA, colorB, t) {
    const a = this.parseHexColor(colorA);
    const b = this.parseHexColor(colorB);
    return this.rgbToHex(
      this.lerp(a.r, b.r, t),
      this.lerp(a.g, b.g, t),
      this.lerp(a.b, b.b, t)
    );
  }

  /**
   * Hashes a string into a positive integer.
   *
   * @param {string} value - Text.
   * @returns {number} Positive hash.
   */
  static hashString(value = '') {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /**
   * Deterministic random from seed.
   *
   * @param {number} seed - Seed.
   * @returns {number} Unit value.
   */
  static seededRandom(seed) {
    const x = Math.sin(seed + 1.2345) * 43758.5453123;
    return x - Math.floor(x);
  }

  /**
   * Sine wave helper.
   *
   * @param {number} time - Time.
   * @param {number} speed - Speed.
   * @param {number} phase - Phase.
   * @param {number} amp - Amplitude.
   * @returns {number} Wave.
   */
  static wave(time, speed, phase = 0, amp = 1) {
    return Math.sin((time * speed) + phase) * amp;
  }

  /**
   * Absolute bounce wave helper.
   *
   * @param {number} time - Time.
   * @param {number} speed - Speed.
   * @param {number} phase - Phase.
   * @param {number} amp - Amplitude.
   * @returns {number} Bounce.
   */
  static bounce(time, speed, phase = 0, amp = 1) {
    return Math.abs(Math.sin((time * speed) + phase)) * amp;
  }
}
