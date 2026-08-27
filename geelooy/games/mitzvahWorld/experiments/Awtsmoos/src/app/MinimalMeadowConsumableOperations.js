// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowConsumableOperations.js
 * @description Applies consumable activation, completion, interruption, cycling, and rejection rules.
 * The Awtsmoos joins carried vessel and recovery without hidden duplication;
 * Awtsmoos.com preserves quantity through windup, revalidates at commit, and names every failed intention.
 */

import {
	minimalMeadowConsumable,
	minimalMeadowConsumableIds
} from './MinimalMeadowConsumableCatalog.js';
import {
	applyMinimalMeadowConsumable
} from './MinimalMeadowConsumableEffects.js';
import {
	minimalMeadowCoreNow
} from './MinimalMeadowCoreClock.js';

export function activateMinimalMeadowConsumable(
	controller,
	itemId = controller.selectedItemId
) {
	const definition = minimalMeadowConsumable(itemId);
	const now = minimalMeadowCoreNow(controller.environment);
	const reason = consumableRejection(controller, definition, now);
	if (reason) return reject(controller, reason);
	controller.selectedItemId = definition.itemId;
	controller.active = Object.freeze({
		completesAt: now + definition.useSeconds,
		itemId: definition.itemId,
		startedAt: now
	});
	const receipt = Object.freeze({
		accepted: true,
		definition,
		...controller.active
	});
	controller.runtime.bus.emit('core:consumable-started', receipt);
	return receipt;
}

export function updateMinimalMeadowConsumable(controller) {
	if (!controller.active) return null;
	const now = minimalMeadowCoreNow(controller.environment);
	if (now < controller.active.completesAt) return controller.active;
	const definition = minimalMeadowConsumable(controller.active.itemId);
	controller.active = null;
	const receipt = applyMinimalMeadowConsumable(
		controller.runtime,
		definition
	);
	if (receipt.accepted) {
		controller.cooldowns.set(
			definition.itemId,
			now + definition.cooldownSeconds
		);
	}
	return receipt;
}

export function interruptMinimalMeadowConsumable(
	controller,
	reason = 'INTERRUPTED'
) {
	if (!controller.active) return false;
	const receipt = Object.freeze({
		accepted: false,
		itemId: controller.active.itemId,
		reason
	});
	controller.active = null;
	controller.runtime.bus.emit('core:consumable-interrupted', receipt);
	return receipt;
}

export function cycleMinimalMeadowConsumable(controller) {
	const ids = minimalMeadowConsumableIds();
	const index = ids.indexOf(controller.selectedItemId);
	controller.selectedItemId = ids[(index + 1) % ids.length];
	const receipt = Object.freeze({
		definition: minimalMeadowConsumable(controller.selectedItemId),
		selectedItemId: controller.selectedItemId
	});
	controller.runtime.bus.emit('core:consumable-selected', receipt);
	return receipt;
}

function consumableRejection(controller, definition, now) {
	if (!definition) return 'CONSUMABLE_UNKNOWN';
	if (controller.runtime.playerDefeat?.isDefeated?.()) return 'PLAYER_DEFEATED';
	if (controller.active) return 'CONSUMABLE_ACTIVE';
	if ((controller.cooldowns.get(definition.itemId) || 0) > now) {
		return 'CONSUMABLE_COOLDOWN';
	}
	if (!controller.runtime.inventory?.quantity?.(definition.itemId)) {
		return 'CONSUMABLE_MISSING';
	}
	if (definition.heal
		&& controller.runtime.playerStats.health
			>= controller.runtime.playerStats.maxHealth) {
		return 'HEALTH_FULL';
	}
	return null;
}

function reject(controller, reason) {
	const receipt = Object.freeze({ accepted: false, reason });
	controller.runtime.bus.emit('core:consumable-rejected', receipt);
	return receipt;
}
