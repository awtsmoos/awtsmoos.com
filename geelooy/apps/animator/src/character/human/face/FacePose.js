
// B"H

/**
 * @file FacePose.js
 * @description
 * ============================================================================
 * CHAPTER: THE FACE WHERE INNER MOTION BECAME VISIBLE
 * ============================================================================
 *
 * The face is not a flat smile pasted on a circle. It is channels: eyes, lids,
 * brows, cheeks, mouth, gaze, jaw, and head motion. Each channel is simple,
 * data-based, and blendable.
 *
 * @module FacePose
 */

/**
 * @class FacePose
 * @description
 * Produces complete face pose objects.
 */
export class FacePose {
  /**
   * Creates a neutral face pose.
   *
   * @returns {Object} Neutral pose.
   */
  static neutral() {
    return {
      eyeOpen: 1,
      pupilX: 0,
      pupilY: 0,
      browInner: 0,
      browOuter: 0,
      browPinch: 0,
      mouthOpen: 0.04,
      mouthWide: 0,
      mouthSmile: 0,
      mouthFrown: 0,
      cheekLift: 0,
      noseWrinkle: 0,
      headTilt: 0,
      headNod: 0
    };
  }

  /**
   * Blends two face poses.
   *
   * @param {Object} a - First pose.
   * @param {Object} b - Second pose.
   * @param {number} weight - Blend amount.
   * @returns {Object} Blended pose.
   */
  static blend(a = {}, b = {}, weight = 1) {
    const base = { ...this.neutral(), ...a };
    const layer = { ...b };
    const w = Math.max(0, Math.min(1, Number(weight)));
    const out = { ...base };

    for (const key of Object.keys(this.neutral())) {
      if (Number.isFinite(layer[key])) {
        out[key] = base[key] * (1 - w) + layer[key] * w;
      }
    }

    return out;
  }
}
