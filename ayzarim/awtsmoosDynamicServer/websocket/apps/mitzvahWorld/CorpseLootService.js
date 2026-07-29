// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CorpseLootService.js
 * @description Claims one nearby defeated spirit corpse and grants one private remnant.
 * The Awtsmoos lets a fallen husk yield one measured testimony; Awtsmoos.com prevents
 * distant, living, animal, duplicate, and replay-forged recovery from entering inventory.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { squaredDistance } = require('./CreatureBrain.js');

const LOOT_RADIUS = 5;
const REMNANT_ITEM_ID = 'shadow-remnant';

class CorpseLootService {
	constructor(options) {
		this.adventures = options.adventures;
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.inventory = options.inventory;
	}

	claim(player, creatureId) {
		const creature = this.creatures.get(creatureId);
		this.requireLootable(creature);
		this.requireNearby(player, creature);
		const inventory = this.inventory.add(player, REMNANT_ITEM_ID, 1);
		creature.lootClaimedAt = this.clock();
		creature.lootClaimedBy = player.id;
		const adventures = this.adventures.recordEvent(player, {
			count: 1,
			target: creature.speciesId,
			type: 'loot'
		});
		return {
			adventures,
			creature: this.creatures.snapshot(creature),
			inventory,
			loot: {
				itemId: REMNANT_ITEM_ID,
				quantity: 1
			}
		};
	}

	requireLootable(creature) {
		if (creature.kind !== 'spirit' || creature.status !== 'defeated') {
			throw new RealtimeError(
				'CORPSE_NOT_LOOTABLE',
				'Only a defeated fictional spirit husk may yield a remnant.'
			);
		}
		if (creature.lootClaimedBy) {
			throw new RealtimeError(
				'CORPSE_ALREADY_LOOTED',
				'That defeated husk has already yielded its remnant.'
			);
		}
	}

	requireNearby(player, creature) {
		if (squaredDistance(player.position, creature.position) <= LOOT_RADIUS * LOOT_RADIUS) {
			return;
		}
		throw new RealtimeError(
			'CORPSE_OUT_OF_RANGE',
			'Move closer before recovering the remnant.'
		);
	}
}

module.exports = {
	CorpseLootService,
	LOOT_RADIUS,
	REMNANT_ITEM_ID
};
