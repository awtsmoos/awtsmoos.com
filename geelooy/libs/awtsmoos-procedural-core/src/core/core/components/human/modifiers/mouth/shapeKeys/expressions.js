
// B"H
/**
 * @file expressions.js
 * @brief
 *   THE JITTER OF THE SOUL — Expression Sculpt Definitions
 *   ================================================================
 *   These are the pure data definitions for every emotive morph target.
 *
 * @module expressions
 */

import { PHONEME_KEY } from '../../../mouth/mouthConstants.js';

const ULY = 3.0;
const LLY = 2.6;
const MZ = 1.25;

export const EXPRESSION_MORPH_MODS = [
    { type: 'defineShapeKey', params: { name: PHONEME_KEY.SNEER_L, query: { box: { min: [-1.2, 2.8, 0.8], max: [0.0, 3.5, 1.8] } }, sculpt: { center: [-0.4, ULY, MZ], radius: 0.4, amount: [0, 0.12, 0.05], falloff: 'smooth' } } },
    { type: 'defineShapeKey', params: { name: PHONEME_KEY.SNEER_R, query: { box: { min: [0.0, 2.8, 0.8], max: [1.2, 3.5, 1.8] } }, sculpt: { center: [0.4, ULY, MZ], radius: 0.4, amount: [0, 0.12, 0.05], falloff: 'smooth' } } },
    { type: 'defineShapeKey', params: { name: PHONEME_KEY.JAW_SHIFT_L, query: { box: { min: [-1.2, 1.8, 0.5], max: [1.2, 2.79, 1.8] } }, sculpt: { center: [0, LLY, MZ], radius: 0.8, amount: [-0.15, 0, 0], falloff: 'smooth' } } },
    { type: 'defineShapeKey', params: { name: PHONEME_KEY.JAW_SHIFT_R, query: { box: { min: [-1.2, 1.8, 0.5], max: [1.2, 2.79, 1.8] } }, sculpt: { center: [0, LLY, MZ], radius: 0.8, amount: [0.15, 0, 0], falloff: 'smooth' } } },
    { type: 'defineShapeKey', params: { name: PHONEME_KEY.NOSTRIL, query: { box: { min: [-0.5, 3.1, 0.8], max: [0.5, 3.7, 1.8] } }, sculpt: { center: [0, ULY + 0.4, MZ], radius: 0.3, amount: [0.08, 0, 0], falloff: 'sharp' } } },
    { type: 'defineShapeKey', params: { name: PHONEME_KEY.CUPID, query: { box: { min: [-0.3, 2.8, 0.8], max: [0.3, 3.2, 1.8] } }, sculpt: { center: [0, ULY, MZ], radius: 0.25, amount: [0, 0.08, 0.03], falloff: 'smooth' } } },
    { type: 'defineShapeKey', params: { name: PHONEME_KEY.CHIN, query: { box: { min: [-0.6, 1.8, 0.8], max: [0.6, 2.5, 1.8] } }, sculpt: { center: [0, LLY - 0.4, MZ], radius: 0.4, amount: [0, 0.05, 0.1], falloff: 'smooth' } } },
    { type: 'defineShapeKey', params: { name: PHONEME_KEY.TONGUE_OUT, query: { tag: 'mouth_inner' }, sculpt: { center: [0, 2.8, MZ - 0.1], radius: 0.35, amount: [0, 0, 0.3], falloff: 'smooth' } } }
];
