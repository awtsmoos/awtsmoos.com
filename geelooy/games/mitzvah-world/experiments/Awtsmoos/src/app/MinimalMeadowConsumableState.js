// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowConsumableState.js
 * @description Resolves rejection, snapshot, selection, and stable restore for quick consumables.
 * The Awtsmoos joins carried vessel and chosen use without hidden duplication;
 * Awtsmoos.com keeps cooldown, quantity, health state, selection, and persistence in one focused helper.
 */

import { minimalMeadowCoreDelayRemaining, minimalMeadowCoreNow } from './MinimalMeadowCoreClock.js';
import { minimalMeadowConsumable, minimalMeadowConsumableIds } from './MinimalMeadowConsumableCatalog.js';

export function minimalMeadowConsumableRejection(runtime, active, cooldowns, definition, environment) {
	const now = minimalMeadowCoreNow(environment);
	if (!definition) return 'CONSUMABLE_UNKNOWN';
	if (runtime.playerDefeat?.isDefeated?.()) return 'PLAYER_DEFEATED';
	if (active) return 'CONSUMABLE_ACTIVE';
	if ((cooldowns.get(definition.itemId) || 0) > now) return 'CONSUMABLE_COOLDOWN';
	if (!runtime.inventory?.quantity?.(definition.itemId)) return 'CONSUMABLE_MISSING';
	if (definition.heal && runtime.playerStats.health >= runtime.playerStats.maxHealth) {
		return 'HEALTH_FULL';
	}
	return null;
}

export function nextMinimalMeadowConsumable(selectedItemId) {
	const ids = minimalMeadowConsumableIds();
	const index = ids.indexOf(selectedItemId);
	return ids[(index + 1) % ids.length];
}

export function snapshotMinimalMeadowConsumable(runtimeValue) {
	const now = minimalMeadowCoreNow(runtimeValue.environment);
	return Object.freeze({
		active: runtimeValue.active ? Object.freeze({ ...runtimeValue.active }) : null,
		cooldownRemaining: minimalMeadowCoreDelayRemaining(
			runtimeValue.cooldowns.get(runtimeValue.selectedItemId),
			now
		),
		quantity: runtimeValue.runtime.inventory?.quantity?.(runtimeValue.selectedItemId) || 0,
		selectedItemId: runtimeValue.selectedItemId
	});
}

export function restoreMinimalMeadowConsumable(runtimeValue, value = {}) {
	if (minimalMeadowConsumable(value.selectedItemId)) {
		runtimeValue.selectedItemId = value.selectedItemId;
	}
	return snapshotMinimalMeadowConsumable(runtimeValue);
}
