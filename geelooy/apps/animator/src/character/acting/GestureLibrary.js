
// B"H

/**
 * @file GestureLibrary.js
 * @description
 * CHAPTER: THE LIBRARY OF LIVING GESTURES
 *
 * These gestures give the characters quick emotional variety.
 * They are simple enough to use from scene events.
 */
export const GestureLibrary = {
  gestures: {
    shrug: {
      shouldersY: -15,
      armL: { upper: 40, lower: 30 },
      armR: { upper: -40, lower: -30 },
      headTilt: 5
    },

    facepalm: {
      headTilt: 15,
      armR: { ikTarget: { x: 0, y: -220 }, bendDir: 1 },
      eyebrows: { bi: -10, ba: 5 }
    },

    thinker: {
      headTilt: -10,
      armL: { ikTarget: { x: 10, y: -180 }, bendDir: -1 },
      eyes: { squint: 0.7 }
    },

    sigh: {
      torsoScaleY: 0.95,
      shouldersY: 10,
      headTilt: 12,
      eyes: { blink: 1.0 }
    },

    breakdown: {
      headTilt: 25,
      shouldersY: 15,
      armL: { ikTarget: { x: -20, y: -230 }, bendDir: -1 },
      armR: { ikTarget: { x: 20, y: -230 }, bendDir: 1 },
      eyebrows: { bi: -25, ba: 10 }
    },

    wave: {
      headTilt: -4,
      armR: { ikTarget: { x: 70, y: -260 }, bendDir: -1 },
      eyebrows: { bi: -4, ba: -8 }
    },

    point: {
      headTilt: -2,
      armR: { ikTarget: { x: 120, y: -200 }, bendDir: -1 },
      eyebrows: { bi: 2, ba: -6 }
    },

    laugh: {
      headTilt: -8,
      shouldersY: -4,
      eyes: { squint: 0.6 },
      eyebrows: { bi: -8, ba: -12 }
    },

    confused: {
      headTilt: 9,
      shouldersY: -3,
      eyebrows: { bi: 7, bo: -7, ba: -4 }
    },

    explain: {
      headTilt: -3,
      armR: { ikTarget: { x: 85, y: -155 }, bendDir: 1 },
      eyebrows: { bi: -3, bo: -4, ba: -8 }
    }
  },

  /**
   * Gets one gesture.
   *
   * @param {string} key - Gesture key.
   * @returns {Object|null} Gesture data.
   */
  get(key) {
    return this.gestures[key] || null;
  }
};
