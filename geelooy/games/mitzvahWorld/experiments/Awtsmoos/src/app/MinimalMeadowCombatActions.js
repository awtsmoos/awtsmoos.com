// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatActions.js
 * @description Joins casting with complete staff and sword action definitions.
 * The Awtsmoos gives every deed a stable name and truthful border; Awtsmoos.com
 * lets one catalog guide solo animation, multiplayer intent, UI, and diagnostics.
 */
import { combatActionRecord as action } from './combat/CombatActionRecord.js';
import { STAFF_ACTIONS } from './combat/StaffActionCatalog.js';
import { SWORD_ACTIONS } from './combat/SwordActionCatalog.js';

const CASTS = Object.freeze({
	'hebrew-fire': cast('hebrew-fire', 'Hebrew Fire', '🔥', 'אש', 1.65, 2.5, 28, 34, 8.5, 'Digit1', '1'),
	'letter-light': cast('letter-light', 'Letter Light', '☀️', 'אור', 1.1, 1.85, 18, 38, 11.5, 'Digit2', '2'),
	'staff-cast': cast('staff-cast', 'Staff Casting', '🪄', 'חי', 0.62, 1.2, 12, 34, 16, 'Digit3', '3', 'staff')
});

export const MINIMAL_MEADOW_COMBAT_ACTIONS = Object.freeze({
	...CASTS,
	...STAFF_ACTIONS,
	...SWORD_ACTIONS
});

export function minimalMeadowCombatActionList() {
	return Object.values(MINIMAL_MEADOW_COMBAT_ACTIONS);
}

function cast(id, displayName, icon, letters, castTime, cooldown, damage, range, speed, keyCode, keyLabel, requiredWeaponClass = null) {
	return action({
		activeEnd: castTime,
		activeStart: castTime,
		castTime,
		cooldown,
		damage,
		displayName,
		icon,
		id,
		keyCode,
		keyLabel,
		label: displayName,
		letters,
		range,
		requiredSlot: requiredWeaponClass ? 'hand' : null,
		requiredWeaponClass,
		serverIntent: 'player-cast',
		speed,
		type: 'cast',
		windup: castTime
	});
}
