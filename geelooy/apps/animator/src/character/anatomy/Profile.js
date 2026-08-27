
// B"H
/**
 * @file Profile.js
 * @description
 * THE PANIM (Faces).
 * B"H
 */

export class Profile {
  /**
   * Calculates the perspective offsets for the actor.
   */
  static get(view = 'front', flipX = false) {
    const dir = flipX ? -1 : 1;

    // Side Profile
    if (view === 'side') {
      return {
        type: 'side',
        dir,
        headOffset: 25 * dir,
        bodyScaleX: 0.55,
        eyes: {
          visible: ['right'],
          right: { x: 26 * dir, scaleX: 0.5 }
        },
        ears: {
          visible: ['right'],
          right: { x: -8 * dir }
        },
        eyebrows: {
          visible: ['right'],
          right: { x: 24 * dir, scaleX: 0.5 }
        },
        nose: { x: 42 * dir, scaleX: 0.8 },
        // B"H - Pushing the mouth forward to the profile edge for absolute clarity.
        mouth: { x: 34 * dir, scaleX: 0.35 },
        legs: { spread: 0, overlap: 15 },
        arms: { spread: 0, overlap: 20 },
        feet: { angle: 0, rollFactor: 1.0 }
      };
    }

    // Three-Quarter
    if (view === 'threeQuarter') {
      return {
        type: 'threeQuarter',
        dir,
        headOffset: 15 * dir,
        bodyScaleX: 0.82,
        eyes: {
          visible: ['left', 'right'],
          left: { x: -12 * dir, scaleX: 0.6 }, 
          right: { x: 30 * dir, scaleX: 0.95 }  
        },
        ears: {
          visible: ['left'],
          left: { x: -44 * dir }
        },
        eyebrows: {
          visible: ['left', 'right'],
          left: { x: -12 * dir, scaleX: 0.6 },
          right: { x: 30 * dir, scaleX: 0.95 }
        },
        nose: { x: 18 * dir, scaleX: 1.0 },
        mouth: { x: 12 * dir, scaleX: 0.8 },
        legs: { spread: 14, overlap: 5 },
        arms: { spread: 42, overlap: 5 },
        feet: { angle: 12 * dir, rollFactor: 0.8 }
      };
    }

    // Default Front View
    return {
      type: 'front',
      dir,
      headOffset: 0,
      bodyScaleX: 1.0,
      eyes: {
        visible: ['left', 'right'],
        left: { x: -18, scaleX: 1.0 },
        right: { x: 18, scaleX: 1.0 }
      },
      ears: {
        visible: ['left', 'right']
      },
      eyebrows: {
        visible: ['left', 'right'],
        left: { x: -20, scaleX: 1.0 },
        right: { x: 20, scaleX: 1.0 }
      },
      nose: { x: 0, scaleX: 1.0 },
      mouth: { x: 0, scaleX: 1.0 },
      legs: { spread: 26, overlap: 0 },
      arms: { spread: 55, overlap: 0 },
      feet: { angle: -15, rollFactor: 0.5 }
    };
  }
}
