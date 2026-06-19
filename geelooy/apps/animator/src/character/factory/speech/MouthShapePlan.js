// B"H

/**
 * @file MouthShapePlan.js
 * @description
 * ============================================================================
 * CHAPTER: THE MOUTH THAT STOPPED TWITCHING AND STARTED SPEAKING
 * ============================================================================
 *
 * A mouth must not receive a new random shape every frame. That is not speech;
 * that is panic. This module creates a deterministic plan for each speech line:
 * several mouth shapes, each held for a small duration, then smoothly blended
 * into the next. It does not match syllables yet. It simply gives the actor
 * a believable speaking rhythm that has memory.
 *
 * The Awtsmoos creates speech from nothing. Human speech moves through vessels:
 * lips, jaw, breath, pause, opening, closure. This plan makes those vessels
 * ordered enough that the cartoon can breathe.
 *
 * @class MouthShapePlan
 */
export class MouthShapePlan {
  /**
   * @type {Object<string, Object>}
   */
  static SHAPES = {
    rest: { w: 18, h: 3, smile: 0.2, round: 0.0, teeth: 0.0 },
    small: { w: 16, h: 6, smile: 0.1, round: 0.2, teeth: 0.0 },
    open: { w: 17, h: 12, smile: 0.0, round: 0.35, teeth: 0.15 },
    wide: { w: 24, h: 8, smile: 0.35, round: 0.0, teeth: 0.25 },
    oo: { w: 10, h: 13, smile: -0.05, round: 0.85, teeth: 0.0 },
    grin: { w: 25, h: 5, smile: 0.7, round: 0.0, teeth: 0.55 },
    soft: { w: 19, h: 7, smile: 0.18, round: 0.15, teeth: 0.1 }
  };

  /**
   * Gets the current smooth mouth shape for a character.
   *
   * @param {Object} data - Character manifest.
   * @returns {Object} Mouth shape.
   */
  static current(data = {}) {
    const speaking = data.isTalking || data.speech;
    if (!speaking) return this.SHAPES.rest;

    const seed = this.seed(`${data.id || 'soul'}:${data.speech || ''}`);
    const duration = this.duration(data);
    const local = Math.max(0, Number(data.speechLocalTime || 0));
    const plan = this.plan(seed, duration);
    const wrapped = duration > 0 ? local % duration : local;

    return this.sample(plan, wrapped);
  }

  /**
   * Resolves speech duration.
   *
   * @param {Object} data - Character manifest.
   * @returns {number} Duration in milliseconds.
   */
  static duration(data = {}) {
    const fromData = data.speechDuration || data.speech?.duration;
    if (Number.isFinite(fromData)) return Math.max(500, fromData);
    const text = String(data.speech || '');
    return Math.max(900, Math.min(5200, text.length * 95));
  }

  /**
   * Creates a deterministic mouth plan.
   *
   * @param {number} seed - Deterministic seed.
   * @param {number} duration - Speech duration.
   * @returns {Array<Object>} Mouth beats.
   */
  static plan(seed, duration) {
    const names = ['small', 'open', 'wide', 'soft', 'oo', 'open', 'grin'];
    const beats = [];
    let t = 0;
    let n = seed;

    beats.push({ at: 0, shape: 'rest' });

    while (t < duration) {
      n = this.next(n);
      const hold = 130 + (n % 150);
      n = this.next(n);
      const shape = names[n % names.length];

      t += hold;
      beats.push({ at: Math.min(duration, t), shape });
    }

    beats.push({ at: duration, shape: 'rest' });
    return beats;
  }

  /**
   * Samples and interpolates a mouth plan.
   *
   * @param {Array<Object>} plan - Mouth beats.
   * @param {number} time - Local speech time.
   * @returns {Object} Interpolated mouth shape.
   */
  static sample(plan, time) {
    let prev = plan[0];
    let next = plan[plan.length - 1];

    for (let i = 1; i < plan.length; i++) {
      if (plan[i].at >= time) {
        next = plan[i];
        prev = plan[i - 1];
        break;
      }
    }

    const span = Math.max(1, next.at - prev.at);
    const raw = Math.max(0, Math.min(1, (time - prev.at) / span));
    const eased = raw * raw * (3 - 2 * raw);

    return this.mix(this.SHAPES[prev.shape], this.SHAPES[next.shape], eased);
  }

  /**
   * Interpolates two shapes.
   *
   * @param {Object} a - First shape.
   * @param {Object} b - Second shape.
   * @param {number} t - Blend amount.
   * @returns {Object} Mixed shape.
   */
  static mix(a, b, t) {
    return {
      w: this.lerp(a.w, b.w, t),
      h: this.lerp(a.h, b.h, t),
      smile: this.lerp(a.smile, b.smile, t),
      round: this.lerp(a.round, b.round, t),
      teeth: this.lerp(a.teeth, b.teeth, t)
    };
  }

  /**
   * Creates a stable seed.
   *
   * @param {string} text - Seed text.
   * @returns {number} Numeric seed.
   */
  static seed(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * Advances a deterministic pseudo-random seed.
   *
   * @param {number} n - Current seed.
   * @returns {number} Next seed.
   */
  static next(n) {
    return (Math.imul(n ^ (n >>> 15), 2246822519) + 3266489917) >>> 0;
  }

  /**
   * Linear interpolation.
   *
   * @param {number} a - Start.
   * @param {number} b - End.
   * @param {number} t - Progress.
   * @returns {number} Interpolated number.
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }
}