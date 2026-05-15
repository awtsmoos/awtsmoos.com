
// B"H
/**
 * @file index.js
 * @brief Unites all Shape Key morph target generators.
 */

import { PHONETIC_MORPH_MODS } from './phoneticDeltas.js';
import { EXPRESSION_MORPH_MODS } from './expressions.js';

export const MOUTH_SHAPE_KEY_MODS = [
    ...PHONETIC_MORPH_MODS,
    ...EXPRESSION_MORPH_MODS
];
