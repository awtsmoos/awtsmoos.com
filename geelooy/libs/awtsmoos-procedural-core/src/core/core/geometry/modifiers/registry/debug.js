
// B"H
/**
 * @file debug.js
 * @brief The registry branch for introspection and logging modifiers.
 */

import { logSelectionModifier } from '../debugSelection.js';

export const DEBUG_MODIFIERS = {
    'logSelection': (mesh, mod, params) => logSelectionModifier(mesh, params)
};
