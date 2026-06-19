// B"H

/**
 * @file StableViewProfile.js
 * @description
 * Chapter: The face stopped becoming a paper coin when it turned sideways.
 * View profiles now preserve readable heads, eyes, shoulders, and gait depth.
 * Side view still feels lateral, but close/mobile frames no longer crush humans
 * into flat puppets.
 */
export class StableViewProfile {
  /**
   * Gets the stable view profile.
   *
   * @param {Object} data - Character data.
   * @returns {Object} View profile.
   */
  static get(data = {}) {
    const raw = data.view || 'threeQuarter';
    const type = raw === 'side' || raw === 'front' ? raw : 'threeQuarter';
    const dir = data.flipX ? -1 : 1;
    return this.profiles(dir)[type];
  }

  /** @param {number} dir - Direction. @returns {Object} Profile map. */
  static profiles(dir) {
    return {
      front: {
        type: 'front', dir,
        head: { offsetX: 0, scaleX: 1, eyeSpread: 15, eyeY: -8, noseX: 0, noseY: -2, mouthX: 0, mouthY: 0, visibleEyes: [-1, 1], nearEyeScale: 1, farEyeScale: 1 },
        torso: { scaleX: 1, centerX: 0, farShoulderPull: 0, nearShoulderPush: 0 },
        limbs: { nearSide: 1, farSide: -1, sideSpread: 1, legDepth: 0, gaitX: 1.08, armFarAlpha: 0.76 },
        feet: { nearAngle: 0.04, farAngle: -0.04 }
      },
      threeQuarter: {
        type: 'threeQuarter', dir,
        head: { offsetX: dir * 4, scaleX: 0.94, eyeSpread: 13.5, eyeY: -8, noseX: dir * 5, noseY: -1, mouthX: dir * 4, mouthY: 1, visibleEyes: [-1, 1], nearEyeScale: 1.02, farEyeScale: 0.84 },
        torso: { scaleX: 0.92, centerX: dir * 3, farShoulderPull: -dir * 4, nearShoulderPush: dir * 7 },
        limbs: { nearSide: dir, farSide: -dir, sideSpread: 0.9, legDepth: 7, gaitX: 1.28, armFarAlpha: 0.62 },
        feet: { nearAngle: dir * 0.06, farAngle: -dir * 0.03 }
      },
      side: {
        type: 'side', dir,
        head: { offsetX: dir * 8, scaleX: 0.82, eyeSpread: 10.5, eyeY: -8, noseX: dir * 10, noseY: -2, mouthX: dir * 9, mouthY: 2, visibleEyes: [dir, -dir], nearEyeScale: 0.96, farEyeScale: 0.42 },
        torso: { scaleX: 0.78, centerX: dir * 7, farShoulderPull: -dir * 8, nearShoulderPush: dir * 11 },
        limbs: { nearSide: dir, farSide: -dir, sideSpread: 0.62, legDepth: 10, gaitX: 1.82, armFarAlpha: 0.45 },
        feet: { nearAngle: dir * 0.12, farAngle: -dir * 0.04 }
      }
    };
  }

  /** @param {Object} view - View. @param {number} side - Side. @returns {boolean} */
  static isFar(view, side) {
    if (view.type === 'front') return side < 0;
    return side === view.limbs.farSide;
  }
}
