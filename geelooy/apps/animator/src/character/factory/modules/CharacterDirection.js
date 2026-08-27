
// B"H

/**
 * @file CharacterDirection.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE MIRROR WAS BANISHED FROM THE OUTER GROUP
 * ═══════════════════════════════════════════════════════════════
 *
 * The exported code showed negative group scaleX and a separate perspective
 * direction. That creates contradiction: the visible body flips, but arms,
 * eyes, ears, and depth still reason from the old direction.
 *
 * This module makes direction explicit. The group scale remains positive.
 * The profile receives the visible direction.
 *
 * The Awtsmoos is One; the body must not obey two opposite decrees.
 *
 * @class CharacterDirection
 */
export class CharacterDirection {
  /**
   * Returns visible facing direction.
   *
   * @param {Object} data - Character data.
   * @returns {number} -1 for flipped, 1 otherwise.
   */
  static facingDir(data) {
    return data?.flipX ? -1 : 1;
  }

  /**
   * Returns positive visual scale.
   *
   * @param {Object} data - Character data.
   * @returns {number} Positive scale.
   */
  static scale(data) {
    const scale = data?.position?.scale;
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  }

  /**
   * Applies visible direction to a profile copy.
   *
   * @param {Object} profile - Base perspective profile.
   * @param {number} dir - Visible direction.
   * @returns {Object} Direction-fixed profile.
   */
  static applyToProfile(profile = {}, dir = 1) {
    return {
      ...profile,
      dir,
      headOffset: this.mirrorNumber(profile.headOffset, dir),
      head: this.mirrorObject(profile.head, dir),
      nose: this.mirrorObject(profile.nose, dir),
      mouth: this.mirrorObject(profile.mouth, dir),
      beard: this.mirrorObject(profile.beard, dir),
      ears: this.mirrorNested(profile.ears, dir),
      eyes: this.mirrorNested(profile.eyes, dir),
      eyebrows: this.mirrorNested(profile.eyebrows, dir),
      arms: {
        ...(profile.arms || {}),
        dirLeft: -dir,
        dirRight: dir
      },
      feet: {
        ...(profile.feet || {}),
        dirLeft: -dir,
        dirRight: dir
      }
    };
  }

  /**
   * Mirrors an object x field.
   *
   * @param {Object} obj - Object with optional x.
   * @param {number} dir - Direction.
   * @returns {Object} Mirrored copy.
   */
  static mirrorObject(obj = {}, dir = 1) {
    return {
      ...obj,
      x: this.mirrorNumber(obj.x, dir)
    };
  }

  /**
   * Mirrors nested left/right/near coordinate objects.
   *
   * @param {Object} obj - Nested profile object.
   * @param {number} dir - Direction.
   * @returns {Object} Mirrored nested copy.
   */
  static mirrorNested(obj = {}, dir = 1) {
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    Object.keys(copy).forEach(key => {
      if (copy[key] && typeof copy[key] === 'object' && !Array.isArray(copy[key])) {
        copy[key] = this.mirrorObject(copy[key], dir);
      }
    });
    return copy;
  }

  /**
   * Mirrors a number only when finite.
   *
   * @param {*} value - Candidate.
   * @param {number} dir - Direction.
   * @returns {number|undefined} Mirrored number.
   */
  static mirrorNumber(value, dir) {
    return Number.isFinite(value) ? Math.abs(value) * dir : value;
  }
}
