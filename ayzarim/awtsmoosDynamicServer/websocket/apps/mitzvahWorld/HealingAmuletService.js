// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HealingAmuletService.js
 * @description Consumes one authoritative amulet only when bounded living-player healing succeeds.
 * The Awtsmoos joins ownership, wound, restoration, and consequence in one server-owned deed;
 * Awtsmoos.com spends no item at full health and never turns a defeated body into a hidden resurrection.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { healingAmuletDefinition } = require('./HealingAmuletCatalog.js');

class HealingAmuletService {
	constructor(inventory) {
		this.inventory = inventory;
	}

	use(player, itemId) {
		const definition = healingAmuletDefinition(itemId);
		if (!definition) fail('ITEM_NOT_HEALING_AMULET', 'That item is not a healing amulet.');
		if (this.inventory.quantity(player, itemId) < 1) {
			fail('ITEM_QUANTITY_UNAVAILABLE', 'That amulet is not in the inventory.');
		}
		const combat = player.combat;
		if (!combat || combat.health <= 0 || combat.status !== 'active') {
			fail('PLAYER_DEFEATED', 'A defeated player must recover before using an amulet.');
		}
		if (combat.health >= combat.maximumHealth) {
			fail('HEALTH_ALREADY_FULL', 'Health is already full.');
		}
		const before = combat.health;
		const healing = Math.min(definition.healing, combat.maximumHealth - before);
		this.inventory.remove(player, itemId, 1);
		combat.health = before + healing;
		return {
			after: combat.health,
			before,
			combat: combatReceipt(combat),
			healing,
			itemId,
			remaining: this.inventory.quantity(player, itemId),
			state: this.inventory.snapshot(player)
		};
	}
}

function combatReceipt(combat) {
	return {
		health: combat.health,
		maximumHealth: combat.maximumHealth,
		status: combat.status
	};
}

function fail(code, message) {
	throw new RealtimeError(code, message);
}

module.exports = {
	HealingAmuletService
};
