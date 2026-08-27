
// B"H

/**
 * @file CharacterPoseNormalizer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE NAME BEFORE THE BODY
 * ═══════════════════════════════════════════════════════════════
 *
 * A character was entering the world with view="threeQuarter" and flipX=true.
 * The outer group flipped with negative scale, while the inner perspective
 * still said dir=1. That is not a style problem. That is two kings wearing
 * one crown, and the limbs obeying the wrong sovereign.
 *
 * This normalizer creates a single immutable pose contract:
 * - view is canonicalized
 * - facingDir is derived from flipX
 * - profile.dir is overwritten to match the actual visible direction
 * - position and scale are never allowed to become undefined
 *
 * The Awtsmoos gives each creation its letters before its shape. This module
 * gives each procedural person its exact directional letters before geometry
 * starts drawing arms, legs, head, hair, mouth, and clothing.
 *
 * @class CharacterPoseNormalizer
 */
export class CharacterPoseNormalizer {
  /**
   * Creates a normalized character render context.
   *
   * @param {Object} data - Raw character data from the active scene.
   * @param {Object} profile - Perspective profile returned by PerspectiveManager.
   * @returns {Object} Normalized render context.
   */
  static normalize(data, profile) {
    const position = data.position || {};
    const scale = Number.isFinite(position.scale) ? position.scale : 1;
    const facingDir = data.flipX ? -1 : 1;
    const view = this.normalizeView(data.view || profile.type || 'front');
    const stableProfile = this.buildProfile(profile, facingDir, view);

    return {
      data,
      profile: stableProfile,
      view,
      facingDir,
      scale,
      groupScaleX: scale,
      groupScaleY: scale,
      x: Number.isFinite(position.x) ? position.x : 0,
      y: Number.isFinite(position.y) ? position.y : 0,
      walkBob: Number.isFinite(data.walk?.bob) ? data.walk.bob : 0
    };
  }

  /**
   * Converts view spelling variants into stable profile names.
   *
   * @param {string} view - Raw view name.
   * @returns {string} Canonical view name.
   */
  static normalizeView(view) {
    const table = {
      threequarter: 'threeQuarter',
      threeQuarter: 'threeQuarter',
      three_quarter: 'threeQuarter',
      '3q': 'threeQuarter',
      side: 'side',
      back: 'back',
      front: 'front',
      up: 'up',
      down: 'down'
    };

    return table[view] || view || 'front';
  }

  /**
   * Builds a mirror-safe profile copy.
   *
   * @param {Object} profile - Original perspective object.
   * @param {number} facingDir - 1 for right-facing, -1 for left-facing.
   * @param {string} view - Canonical view name.
   * @returns {Object} Direction-rectified profile.
   */
  static buildProfile(profile, facingDir, view) {
    const cloned = {
      ...profile,
      type: view,
      dir: facingDir,
      head: { ...(profile.head || {}) },
      body: { ...(profile.body || {}) },
      torso: { ...(profile.torso || {}) },
      eyes: this.cloneNested(profile.eyes || {}),
      eyebrows: this.cloneNested(profile.eyebrows || {}),
      mouth: { ...(profile.mouth || {}) },
      beard: { ...(profile.beard || {}) },
      nose: { ...(profile.nose || {}) },
      ears: this.cloneNested(profile.ears || {}),
      legs: { ...(profile.legs || {}) },
      arms: { ...(profile.arms || {}) },
      feet: { ...(profile.feet || {}) }
    };

    cloned.arms.dirLeft = this.numberOr(cloned.arms.dirLeft, -1) * facingDir;
    cloned.arms.dirRight = this.numberOr(cloned.arms.dirRight, 1) * facingDir;
    cloned.feet.dirLeft = this.numberOr(cloned.feet.dirLeft, -1) * facingDir;
    cloned.feet.dirRight = this.numberOr(cloned.feet.dirRight, 1) * facingDir;

    return cloned;
  }

  /**
   * Copies a shallow object whose children may also be objects.
   *
   * @param {Object} obj - Object to copy.
   * @returns {Object} Safe nested copy.
   */
  static cloneNested(obj) {
    const out = Array.isArray(obj) ? [...obj] : { ...obj };
    Object.keys(out).forEach(key => {
      if (out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
        out[key] = { ...out[key] };
      }
    });
    return out;
  }

  /**
   * Returns a finite number or a fallback.
   *
   * @param {*} value - Candidate numeric value.
   * @param {number} fallback - Fallback number.
   * @returns {number} Safe finite number.
   */
  static numberOr(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }
}
