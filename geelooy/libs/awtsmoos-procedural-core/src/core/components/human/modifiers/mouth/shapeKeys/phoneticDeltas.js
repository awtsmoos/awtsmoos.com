
// B"H
/**
 * @file phoneticDeltas.js
 * @brief
 *   THE EIGHT GATES OF PHONETIC MANIFESTATION — Sculpt Definitions
 *   ================================================================
 *   These are the pure data definitions for every phonetic morph target.
 *   Now that the lips are true topological boundaries of a CSG void,
 *   we use spatial boxes combined with the 'lip_rim' tag to perfectly
 *   isolate and manipulate the upper and lower portions of the opening!
 *
 * @module phoneticDeltas
 */

import { PHONEME_KEY } from '../../../mouth/mouthConstants.js';

// B"H - Precise anchoring coordinates for the CSG cavity
const MY = 2.75;   // Mouth Y Center (Where the CSG cut was made)
const MZ = 1.0;    // Mouth Z Surface

export const PHONETIC_MORPH_MODS = [
    // ── GATE 0 / 1: CLOSURE (The Sealing of the Lips) ──
    // Pulls the TOP half of the lip_rim DOWN
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.CLOSE_UPPER, 
            query: { 
                and: [ 
                    { tag: 'lip_rim' }, 
                    { box: { min: [-1.0, MY, 0.0], max: [1.0, MY + 1.0, 2.0] } } 
                ] 
            }, 
            sculpt: { center: [0, MY + 0.2, MZ], radius: 0.6, amount: [0, -0.15, 0.05], falloff: 'smooth' } 
        } 
    },
    // Pulls the BOTTOM half of the lip_rim UP
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.CLOSE_LOWER, 
            query: { 
                and: [ 
                    { tag: 'lip_rim' }, 
                    { box: { min: [-1.0, MY - 1.0, 0.0], max: [1.0, MY, 2.0] } } 
                ] 
            }, 
            sculpt: { center: [0, MY - 0.2, MZ], radius: 0.6, amount: [0, 0.15, 0.05], falloff: 'smooth' } 
        } 
    },

    // ── GATE 3: OH / OO / U — PUCKER ──
    // Pulls the entire rim forward and together
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.PUCKER, 
            query: { tag: 'lip_rim' }, 
            sculpt: { center: [0, MY, MZ], radius: 0.7, amount: [0, 0, 0.25], falloff: 'dome' } 
        } 
    },

    // ── GATE 2: AH — JAW DROP ──
    // Pulls the lower rim heavily downwards
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.DROP, 
            query: { 
                and: [ 
                    { tag: 'lip_rim' }, 
                    { box: { min: [-1.0, MY - 1.0, 0.0], max: [1.0, MY, 2.0] } } 
                ] 
            }, 
            sculpt: { center: [0, MY - 0.2, MZ], radius: 1.0, amount: [0, -0.4, -0.05], falloff: 'smooth' } 
        } 
    },

    // ── GATE 4: EE / AY — WIDE CHEEK ──
    // Pulls the corners of the mouth outward
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.WIDE_CHEEK, 
            query: { tag: 'lip_rim' }, 
            sculpt: { center: [0, MY, MZ], radius: 1.0, amount: [0.3, 0.05, -0.1], falloff: 'linear' } 
        } 
    },

    // ── GATE 5: F / V — LOWER LIP POUT ──
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.LOWER_POUT, 
            query: { 
                and: [ 
                    { tag: 'lip_rim' }, 
                    { box: { min: [-1.0, MY - 1.0, 0.0], max: [1.0, MY, 2.0] } } 
                ] 
            }, 
            sculpt: { center: [0, MY - 0.1, MZ], radius: 0.5, amount: [0, 0.1, 0.15], falloff: 'smooth' } 
        } 
    },

    // ── GATE 6: L / R / D / N — TONGUE UP ──
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.TONGUE_UP, 
            query: { tag: 'mouth_inner' }, 
            sculpt: { center: [0, MY, MZ - 0.2], radius: 0.4, amount: [0, 0.15, 0.02], falloff: 'smooth' } 
        } 
    },

    // ── GATE 7: TH / S / Z — LIP COMPRESS ──
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.LIP_COMPRESS, 
            query: { tag: 'lip_rim' }, 
            sculpt: { center: [0, MY, MZ], radius: 0.6, amount: [0, 0.05, -0.1], falloff: 'smooth' } 
        } 
    },

    // ── SECONDARY: LIP ROLLS ──
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.LIP_ROLL_IN, 
            query: { tag: 'lip_rim' }, 
            sculpt: { center: [0, MY, MZ], radius: 0.6, amount: [0, 0, -0.15], falloff: 'sharp' } 
        } 
    },
    { 
        type: 'defineShapeKey', 
        params: { 
            name: PHONEME_KEY.LIP_ROLL_OUT, 
            query: { tag: 'lip_rim' }, 
            sculpt: { center: [0, MY, MZ], radius: 0.6, amount: [0, 0, 0.15], falloff: 'smooth' } 
        } 
    }
];
  