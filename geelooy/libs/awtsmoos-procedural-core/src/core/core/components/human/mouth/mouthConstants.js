
// B"H
/**
 * @file mouthConstants.js
 * @brief
 *   THE IMMUTABLE DECREES OF THE ORAL VESSEL
 *   ==========================================
 *   Every constant here is derived from the head geometry in headGen.js:
 *     - Icosphere radius 4.0, elongated Y×1.35 Z×1.1 X×0.92
 *     - Face surface (front of head) is at Z ≈ 1.15
 *     - Mouth center is at Y ≈ 2.75
 *     - Upper lip center: Y ≈ 3.08
 *     - Lower lip / jaw edge: Y ≈ 2.55
 *
 *   OCCLUSION PLANE: the Y level at which upper and lower teeth meet
 *   when the jaw is closed. Both dental arches are positioned relative
 *   to their exported anchor points so they kiss at this plane.
 *
 * @module mouthConstants
 */

/** Center of the oral cavity in un-deformed geometry space. */
export const MOUTH_CORE = {
    CENTER_X: 0,
    CENTER_Y: 2.8,
    CENTER_Z: 1.25
};

/** Jaw bone pivot (relative to head bone). Back of jaw = negative Z. */
export const MOUTH_JAW_PIVOT = [0, -0.05, -0.25];

/**
 * B"H - TIKKUN OF THE DENTAL THRONE
 * Since the mouth opening is now a true topological inward extrusion,
 * the teeth simply need to be pushed slightly back (Z) from the opening.
 */
export const TEETH_OFFSET_TOP    = [0, 0.02, -0.15];
export const TEETH_OFFSET_BOTTOM = [0, -0.02, -0.15];

/** Arch shape parameters — used by teethBuilder. */
export const ARCH = {
    WIDTH:       0.4,    // Narrowed to fit the precise cavity
    DEPTH:       0.2,    // Front-to-back depth
    CURVE:       3.0,    // Parabola steepness
    TOOTH_COUNT: 14,     // Tooth count
    TOOTH_W:     0.035,  // Tooth width (X)
    TOOTH_H:     0.08,   // Tooth height (Y)
    TOOTH_D:     0.03,   // Tooth depth (Z)
    GUM_RADIUS:  0.035,  // Gum tube radius
    GUM_SEGS:    8,      // Gum tube smoothness
    GUM_COLOR:   [0.85, 0.35, 0.40, 1.0], 
    TOOTH_COLOR: [0.98, 0.98, 0.96, 1.0]
};

/** Tongue geometry parameters — used by tongueBuilder. */
export const TONGUE = {
    SCALE_X:  0.2,
    SCALE_Y:  0.06,
    SCALE_Z:  0.25,
    OFFSET_Y: -0.1,  
    OFFSET_Z: -0.18, 
    COLOR:    [0.85, 0.35, 0.4, 1.0]
};

/** Maximum jaw rotation in radians when fully open. */
export const MAX_JAW_OPEN = 0.65;

/** Mouth phoneme key names — single source of truth for all modules. */
export const PHONEME_KEY = {
    CLOSE_UPPER:  'mouth_close_upper',
    CLOSE_LOWER:  'mouth_close_lower',
    PUCKER:       'mouth_pucker',
    DROP:         'mouth_drop',
    WIDE_CHEEK:   'mouth_wide_cheek',
    LOWER_POUT:   'lower_lip_pout',
    TONGUE_UP:    'tongue_up',
    LIP_COMPRESS: 'lip_compress',
    LIP_ROLL_IN:  'lip_roll_in',
    LIP_ROLL_OUT: 'lip_roll_out',
    SNEER_L:      'mouth_sneer_l',
    SNEER_R:      'mouth_sneer_r',
    JAW_SHIFT_L:  'jaw_shift_l',
    JAW_SHIFT_R:  'jaw_shift_r',
    NOSTRIL:      'nostril_flare',
    CUPID:        'cupid_bow_lift',
    CHIN:         'chin_bulge',
    TONGUE_OUT:   'tongue_out'
};
