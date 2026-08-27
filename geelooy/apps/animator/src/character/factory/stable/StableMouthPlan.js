// B"H

/**
 * @file StableMouthPlan.js
 * @description
 * ============================================================================
 * CHAPTER: THE MOUTH THAT HAS A PLAN
 * ============================================================================
 *
 * No new random shape every frame. The seed is stable per speech event. Shapes
 * are chosen deterministically and interpolated.
 *
 * @class StableMouthPlan
 */
export class StableMouthPlan {
  static shapes = {
    rest: { w: 18, h: 3, smile: 0.2, teeth: 0 },
    small: { w: 17, h: 7, smile: 0.08, teeth: 0 },
    open: { w: 18, h: 13, smile: 0, teeth: 0.08 },
    wide: { w: 25, h: 9, smile: 0.32, teeth: 0.18 },
    round: { w: 12, h: 14, smile: -0.03, teeth: 0 },
    grin: { w: 26, h: 6, smile: 0.62, teeth: 0.34 }
  };

  /**
   * Current mouth.
   *
   * @param {Object} data - Character.
   * @returns {Object} Shape.
   */
  static current(data = {}) {
    if (!data.isTalking && !data.speech) return this.shapes.rest;

    const duration = Math.max(500, Number(data.speechDuration || 1600));
    const local = Math.max(0, Number(data.speechLocalTime || 0)) % duration;
    const plan = this.plan(String(data.speechSeed || data.speech || data.id || 'talk'), duration);
    return this.sample(plan, local);
  }

  /**
   * Plan.
   *
   * @param {string} seedText - Seed.
   * @param {number} duration - Duration.
   * @returns {Array<Object>} Beats.
   */
  static plan(seedText, duration) {
    const names = ['small', 'open', 'wide', 'round', 'open', 'grin'];
    let seed = this.seed(seedText);
    let t = 0;
    const beats = [{ at: 0, shape: 'rest' }];

    while (t < duration) {
      seed = this.next(seed);
      t += 140 + (seed % 150);
      seed = this.next(seed);
      beats.push({ at: Math.min(t, duration), shape: names[seed % names.length] });
    }

    beats.push({ at: duration, shape: 'rest' });
    return beats;
  }

  /**
   * Samples plan.
   *
   * @param {Array<Object>} plan - Plan.
   * @param {number} time - Time.
   * @returns {Object} Shape.
   */
  static sample(plan, time) {
    let a = plan[0];
    let b = plan[plan.length - 1];

    for (let i = 1; i < plan.length; i++) {
      if (plan[i].at >= time) {
        a = plan[i - 1];
        b = plan[i];
        break;
      }
    }

    const span = Math.max(1, b.at - a.at);
    const t = Math.max(0, Math.min(1, (time - a.at) / span));
    const e = t * t * (3 - 2 * t);
    return this.mix(this.shapes[a.shape], this.shapes[b.shape], e);
  }

  /**
   * Mixes shapes.
   *
   * @param {Object} a - A.
   * @param {Object} b - B.
   * @param {number} t - Amount.
   * @returns {Object} Shape.
   */
  static mix(a, b, t) {
    return {
      w: a.w + (b.w - a.w) * t,
      h: a.h + (b.h - a.h) * t,
      smile: a.smile + (b.smile - a.smile) * t,
      teeth: a.teeth + (b.teeth - a.teeth) * t
    };
  }

  /**
   * Seed.
   *
   * @param {string} text - Text.
   * @returns {number} Seed.
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
   * Next seed.
   *
   * @param {number} n - Seed.
   * @returns {number} Next.
   */
  static next(n) {
    return (Math.imul(n ^ (n >>> 15), 2246822519) + 3266489917) >>> 0;
  }
}