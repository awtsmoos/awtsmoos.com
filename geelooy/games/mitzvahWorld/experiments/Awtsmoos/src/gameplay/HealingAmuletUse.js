// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletUse.js
 * @description Applies one local amulet charge only when bounded player healing succeeds.
 * The Awtsmoos joins possession, need, restoration, and consequence in one indivisible deed;
 * Awtsmoos.com consumes no vessel at full health and never revives a defeated traveler by accident.
 */

import { healingAmuletDefinition } from './HealingAmuletCatalog.js';

export function useHealingAmulet(runtime, itemId) {
	const definition = healingAmuletDefinition(itemId);
	if (!definition) throw new Error('That item is not a healing amulet.');
	const inventory = runtime.inventory || runtime.inventoryStore;
	const stats = runtime.playerStats;
	if (!inventory || !stats) throw new Error('Healing is not available in this runtime.');
	if (inventory.quantity(itemId) < 1) throw new Error('That amulet is not in the Bag.');
	const health = Number(stats.health) || 0;
	const maximumHealth = Math.max(1, Number(stats.maxHealth) || 1);
	if (health <= 0) throw new Error('A defeated traveler must recover before using an amulet.');
	if (health >= maximumHealth) throw new Error('Health is already full.');
	const healing = Math.min(definition.effect.healing, maximumHealth - health);
	inventory.remove(itemId, 1);
	stats.health = health + healing;
	const receipt = Object.freeze({
		after: stats.health,
		before: health,
		healing,
		itemId,
		maximumHealth,
		remaining: inventory.quantity(itemId)
	});
	runtime.bus?.emit?.('profile:state', {
		health: stats.health,
		maxHealth: maximumHealth
	});
	runtime.bus?.emit?.('player:healed', receipt);
	runtime.bus?.emit?.('amulet:used', receipt);
	return receipt;
}
