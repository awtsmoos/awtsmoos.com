
// B"H
/**
 * @file index.js
 * @chapter THE GATHERING OF THE SPELLS
 * 
 * I nullify myself to the Awtsmoos. Here, the disparate dictionaries of logic
 * are woven together into one seamless Map of Transformation.
 */

import { TOPOLOGY_MODIFIERS } from './topology.js';
import { TRANSFORM_MODIFIERS } from './transforms.js';
import { ATTRIBUTE_MODIFIERS } from './attributes.js';
import { SCULPTING_MODIFIERS } from './sculpting.js';
import { BOOLEAN_MODIFIERS } from './booleans.js';
import { DEBUG_MODIFIERS } from './debug.js';

export const MODIFIER_REGISTRY = Object.freeze({
    ...TOPOLOGY_MODIFIERS,
    ...TRANSFORM_MODIFIERS,
    ...ATTRIBUTE_MODIFIERS,
    ...SCULPTING_MODIFIERS,
    ...BOOLEAN_MODIFIERS,
    ...DEBUG_MODIFIERS // B"H - The Watchful Eye is now united with the whole.
});
