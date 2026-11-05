// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowConsumableEffects.js
 * @description Commits bounded healing or cleansing only after inventory quantity is removed.
 * The Awtsmoos joins carried vessel and restored state without hidden duplication;
 * Awtsmoos.com revalidates quantity, mutates once, publishes stats, and exposes one effect receipt.
 */

export function applyMinimalMeadowConsumable(runtime, definition) {
	const inventory = runtime.inventory;
	if (!inventory?.quantity?.(definition.itemId)) {
		return Object.freeze({ accepted: false, reason: 'CONSUMABLE_MISSING' });
	}
	inventory.remove(definition.itemId, 1);
	const beforeHealth = Number(runtime.playerStats.health || 0);
	if (definition.heal) {
		runtime.playerStats.health = Math.min(
			runtime.playerStats.maxHealth,
			beforeHealth + definition.heal
		);
	}
	if (definition.cleanseCount) {
		applyCleanse(runtime, definition);
	}
	const receipt = Object.freeze({
		accepted: true,
		healed: runtime.playerStats.health - beforeHealth,
		itemId: definition.itemId,
		remaining: inventory.quantity(definition.itemId)
	});
	runtime.bus.emit('profile:state', { ...runtime.playerStats });
	runtime.bus.emit('core:consumable-committed', receipt);
	return receipt;
}

function applyCleanse(runtime, definition) {
	const detail = Object.freeze({
		cleanseCount: definition.cleanseCount,
		postureRestore: definition.postureRestore,
		source: definition.itemId
	});
	runtime.statusEffects?.clearNegative?.(
		'player',
		definition.cleanseCount
	);
	runtime.combat?.statuses?.clearNegative?.(
		'player',
		definition.cleanseCount
	);
	runtime.verticalSlice?.posture?.restore?.(
		'player',
		definition.postureRestore
	);
	runtime.bus.emit('combat:cleanse', detail);
}
