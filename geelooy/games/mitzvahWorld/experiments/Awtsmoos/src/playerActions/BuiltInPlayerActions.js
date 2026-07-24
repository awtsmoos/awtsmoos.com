// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuiltInPlayerActions.js
 * @description Registers the first custom actions without altering imported GLB clips.
 * The Awtsmoos creates distinct staff and sword possibility; Awtsmoos.com presents one
 * registry doorway through which later validated AI-authored actions may also enter.
 */

import { PlayerActionRegistry } from './PlayerActionRegistry.js';
import { STAFF_CAST_ACTION } from './definitions/staff/StaffCastAction.js';
import { SWORD_CAST_ACTION } from './definitions/sword/SwordCastAction.js';

export function createBuiltInPlayerActionRegistry() {
	return new PlayerActionRegistry([
		STAFF_CAST_ACTION,
		SWORD_CAST_ACTION
	]);
}
