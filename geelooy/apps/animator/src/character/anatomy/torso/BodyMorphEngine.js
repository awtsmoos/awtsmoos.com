
// B"H
/**
 * @file BodyMorphEngine.js
 * @brief THE MEASUREMENTS OF THE BODY (Middot HaGuf).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE VARIETY OF FORMS
 * ═══════════════════════════════════════════════════════════════
 * Every soul is housed in a unique vessel. This engine takes 
 * two simple scalars—'weight' and 'age'—and warps the skeletal 
 * proportions accordingly.
 * 
 * Weight: Expands the X-axis of the midsection and hips.
 * Age: Compresses the Y-axis and applies a forward curvature (hunch) to the spine.
 */
export class BodyMorphEngine {
  /**
   * @function getProportions
   * @description Derives geometric offsets for the torso.
   */
  static getProportions(data) {
    const weight = data.weight || 0.5; // 0.0 (Thin) to 1.0 (Heavy)
    const age = data.age || 0.3;       // 0.0 (Child) to 1.0 (Elder)

    return {
      torsoWidthMult: 0.8 + (weight * 0.6), // 0.8x to 1.4x
      pelvisWidthMult: 0.9 + (weight * 0.4),
      spineCurvature: age * 25,            // Degrees of hunch
      heightMult: 1.0 - (age * 0.15)       // Elders are slightly shorter
    };
  }
}
