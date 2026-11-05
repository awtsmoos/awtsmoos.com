// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatActions.js
 * @description Composes casting, support, counter, staff, and sword action definitions.
 * The Awtsmoos gives every deed a stable name while focused catalogs preserve detail;
 * Awtsmoos.com exposes one immutable action universe to UI, runtime, authority, and diagnostics.
 */

import {
	MINIMAL_MEADOW_CAST_ACTIONS
} from './MinimalMeadowCastActionCatalog.js';
import { STAFF_ACTIONS } from './combat/StaffActionCatalog.js';
import { SWORD_ACTIONS } from './combat/SwordActionCatalog.js';

export const MINIMAL_MEADOW_COMBAT_ACTIONS = Object.freeze({
	...MINIMAL_MEADOW_CAST_ACTIONS,
	...STAFF_ACTIONS,
	...SWORD_ACTIONS
});

export function minimalMeadowCombatActionList() {
	return Object.values(MINIMAL_MEADOW_COMBAT_ACTIONS);
}
