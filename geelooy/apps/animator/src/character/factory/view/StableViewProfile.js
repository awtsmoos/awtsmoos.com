// B"H

/**
 * @file StableViewProfile.js
 * @description
 * Chapter: The legacy view profile became an adapter to the cinematic grammar.
 * This file is kept because older imports still call it. It no longer competes
 * with the stable production profile; it returns compatible fields while using
 * the same proportions, depth, and side-view mercy as the main character stack.
 */
export class StableViewProfile {
  /**
   * Resolves a direction-aware view profile.
   *
   * @param {Object} data - Character manifest.
   * @returns {Object} View profile.
   */
  static get(data = {}) {
    const type = this.normalize(data.view || data.profile || 'threeQuarter');
    const dir = data.flipX ? -1 : 1;
    const map = {
      front: this.front(dir),
      side: this.side(dir),
      threeQuarter: this.threeQuarter(dir)
    };
    return map[type] || map.threeQuarter;
  }

  /** @param {string} view - Raw view. @returns {string} Canonical view. */
  static normalize(view) {
    const key = String(view || '').replace(/[-_\s]/g, '').toLowerCase();
    const map = {
      front: 'front',
      panim: 'front',
      side: 'side',
      profile: 'side',
      three: 'threeQuarter',
      threequarter: 'threeQuarter',
      '3q': 'threeQuarter'
    };
    return map[key] || 'threeQuarter';
  }

  /** @param {number} dir - Direction. @returns {Object} Front profile. */
  static front(dir) {
    return this.compat({
      type: 'front', dir,
      bodyScaleX: 1, headScaleX: 1, torsoScaleX: 1,
      headOffsetX: 0, eyeSpread: 15, visibleEyes: ['left', 'right'],
      noseX: 0, mouthX: 0, earMode: 'both',
      nearSide: dir > 0 ? 'right' : 'left', farSide: dir > 0 ? 'left' : 'right',
      shoulderDepth: 0, legDepth: 0, footAngle: 0,
      armAlphaFar: 0.84, legAlphaFar: 0.9, sideSpreadMultiplier: 1
    });
  }

  /** @param {number} dir - Direction. @returns {Object} Side profile. */
  static side(dir) {
    return this.compat({
      type: 'side', dir,
      bodyScaleX: 1, headScaleX: 0.82, torsoScaleX: 0.78,
      headOffsetX: 8 * dir, eyeSpread: 10.5,
      visibleEyes: dir > 0 ? ['right', 'leftHint'] : ['left', 'rightHint'],
      noseX: 17 * dir, mouthX: 10 * dir, earMode: 'near',
      nearSide: dir > 0 ? 'right' : 'left', farSide: dir > 0 ? 'left' : 'right',
      shoulderDepth: 8, legDepth: 10, footAngle: 0.18 * dir,
      armAlphaFar: 0.45, legAlphaFar: 0.68, sideSpreadMultiplier: 0.62
    });
  }

  /** @param {number} dir - Direction. @returns {Object} Three-quarter profile. */
  static threeQuarter(dir) {
    return this.compat({
      type: 'threeQuarter', dir,
      bodyScaleX: 1, headScaleX: 0.94, torsoScaleX: 0.92,
      headOffsetX: 4 * dir, eyeSpread: 13.5,
      visibleEyes: ['left', 'right'], noseX: 7 * dir, mouthX: 4 * dir,
      earMode: 'near-plus-hint', nearSide: dir > 0 ? 'right' : 'left', farSide: dir > 0 ? 'left' : 'right',
      shoulderDepth: 7, legDepth: 7, footAngle: 0.14 * dir,
      armAlphaFar: 0.62, legAlphaFar: 0.78, sideSpreadMultiplier: 0.9
    });
  }

  /** @param {Object} base - Legacy shape. @returns {Object} Compatible profile. */
  static compat(base) {
    return {
      ...base,
      head: {
        offsetX: base.headOffsetX,
        scaleX: base.headScaleX,
        eyeSpread: base.eyeSpread,
        noseX: base.noseX,
        mouthX: base.mouthX
      },
      torso: { scaleX: base.torsoScaleX, centerX: base.headOffsetX * 0.35 },
      limbs: {
        nearSide: base.nearSide === 'right' ? 1 : -1,
        farSide: base.farSide === 'right' ? 1 : -1,
        legDepth: base.legDepth,
        gaitX: base.type === 'side' ? 1.82 : base.type === 'threeQuarter' ? 1.28 : 1.08,
        armFarAlpha: base.armAlphaFar
      }
    };
  }

  /** @param {Object} profile - View profile. @param {number} side - Side. @returns {boolean} */
  static isFar(profile, side) {
    const numericFar = profile?.limbs?.farSide;
    if (Number.isFinite(numericFar)) return side === numericFar;
    const name = side < 0 ? 'left' : 'right';
    return profile?.farSide === name;
  }
}
