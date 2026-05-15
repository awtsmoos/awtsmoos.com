
// B"H
/**
 * @file phonemeGates.js
 * @brief
 *   THE EIGHT GATES OF DIVINE SPEECH — Pure Data Module
 *   =====================================================
 *   The Sefer Yetzirah divides the 22 Hebrew letters by articulation:
 *   lips, teeth, palate, tongue, throat. These 8 archetypal mouth
 *   shapes capture that full spectrum in a form the Golem can wear.
 *
 *   Each gate is a weight map: { keyName: weight (0-1) }.
 *   Key names MUST match those defined in phoneticDeltas.js and
 *   referenced in PHONEME_KEY (mouthConstants.js).
 *
 *   GATE PHONETIC COVERAGE:
 *   ┌──────┬─────────────────────────────────────────────────────────┐
 *   │ 0    │ REST     — sealed neutral. Silence. The void.           │
 *   │ 1    │ M/B/P    — bilabial closure. Lips sealed.               │
 *   │ 2    │ AH       — maximal jaw drop. Pure open vowel.           │
 *   │ 3    │ OH/OO/U  — lip pucker. Rounded aperture.               │
 *   │ 4    │ EE/AY/I  — wide cheek retraction. High jaw.            │
 *   │ 5    │ F/V      — lower lip to upper teeth.                    │
 *   │ 6    │ L/R/D/N  — tongue body rises.                          │
 *   │ 7    │ TH/S/Z   — near-closure, teeth visible.                │
 *   └──────┴─────────────────────────────────────────────────────────┘
 *
 * @module phonemeGates
 */

/**
 * @constant PHONEME_GATES
 * @type {Array<{label: string, weights: Object.<string,number>}>}
 * @description
 *   Indexed array of the 8 phoneme states.
 *   OratorLogic indexes into this array by gate number (0-7).
 *   The UI generates one button per entry using the `label` field.
 */
export const PHONEME_GATES = [

    // ── GATE 0: REST ─────────────────────────────────────────────────
    {
        label: 'REST',
        weights: {
            mouth_close_upper: 0.60,
            mouth_close_lower: 0.60
        }
    },

    // ── GATE 1: M / B / P ────────────────────────────────────────────
    {
        label: 'M/B/P',
        weights: {
            mouth_close_upper: 0.85,
            mouth_close_lower: 0.92,
            lip_compress:       0.65,
            lip_roll_in:        0.30
        }
    },

    // ── GATE 2: AH ───────────────────────────────────────────────────
    {
        label: 'AH',
        weights: {
            mouth_drop:    0.95,
            lower_lip_pout: 0.28,
            mouth_sneer_l: 0.06
        }
    },

    // ── GATE 3: OH / OO / U ──────────────────────────────────────────
    {
        label: 'OH/OO',
        weights: {
            mouth_pucker:   0.95,
            mouth_drop:     0.18,
            lower_lip_pout: 0.38,
            nostril_flare:  0.22
        }
    },

    // ── GATE 4: EE / AY / I ──────────────────────────────────────────
    {
        label: 'EE/AY',
        weights: {
            mouth_wide_cheek: 0.90,
            mouth_drop:       0.16,
            cupid_bow_lift:   0.28
        }
    },

    // ── GATE 5: F / V ────────────────────────────────────────────────
    {
        label: 'F/V',
        weights: {
            lower_lip_pout:    0.88,
            mouth_close_upper: 0.18,
            jaw_shift_l:       0.06
        }
    },

    // ── GATE 6: L / R / D / N ────────────────────────────────────────
    {
        label: 'L/R/D',
        weights: {
            tongue_up:      0.90,
            mouth_drop:     0.32,
            lower_lip_pout: 0.12
        }
    },

    // ── GATE 7: TH / S / Z ───────────────────────────────────────────
    {
        label: 'TH/S/Z',
        weights: {
            lip_compress:      0.70,
            mouth_drop:        0.20,
            mouth_close_upper: 0.22
        }
    }
];

/**
 * @constant ALL_GATE_KEYS
 * @description
 *   Union of every key name used across all 8 gates, plus secondary jitter keys.
 *   Used to initialize and reset weight maps in OratorLogic.
 * @type {string[]}
 */
export const ALL_GATE_KEYS = (() => {
    const s = new Set();
    PHONEME_GATES.forEach(g => Object.keys(g.weights).forEach(k => s.add(k)));
    // Secondary expression / jitter keys
    ['mouth_sneer_l','mouth_sneer_r','jaw_shift_l','jaw_shift_r',
     'nostril_flare','cupid_bow_lift','chin_bulge','tongue_out'].forEach(k => s.add(k));
    return [...s];
})();
