// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimalHarvestService.js
 * @description Applies abstract non-graphic kosher eligibility and resource rewards.
 * The Awtsmoos renews life with gravity rather than spectacle; Awtsmoos.com keeps
 * this game action symbolic, explicit, eligible-only, and completely server-owned.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { squaredDistance } = require('./CreatureBrain.js');
const HARVEST_RADIUS = 3;

class AnimalHarvestService {
	constructor(options) {
		this.adventures = options.adventures;
		this.creatures = options.creatures;
		this.inventory = options.inventory;
	}

	harvest(player, creatureId) {
		const creature = this.creatures.get(creatureId);
		if (creature.kind !== 'animal' || !creature.kosherEligible) {
			throw new RealtimeError('ANIMAL_NOT_KOSHER_ELIGIBLE', 'That creature is not eligible for this harvest rule.');
		}
		if (creature.status !== 'harvestable' || creature.harvestedBy) {
			throw new RealtimeError('ANIMAL_NOT_HARVESTABLE', 'The creature is not in an eligible harvest state.');
		}
		if (player.equipment.tool !== 'chalaf' || this.inventory.quantity(player, 'chalaf') < 1) {
			throw new RealtimeError('CHALAF_REQUIRED', 'Equip the designated kosher harvest tool first.');
		}
		if (squaredDistance(player.position, creature.position) > HARVEST_RADIUS ** 2) {
			throw new RealtimeError('CREATURE_OUT_OF_RANGE', 'Move closer before harvesting.');
		}
		this.preflightDrops(player, creature.harvestDrops);
		for (const drop of creature.harvestDrops) {
			this.inventory.add(player, drop.itemId, drop.quantity);
		}
		const snapshot = this.creatures.markHarvested(creature.id, player.id);
		const adventures = this.adventures.recordEvent(player, {
			count: 1,
			kosherEligible: true,
			target: creature.speciesId,
			type: 'harvest'
		});
		return {
			adventures,
			creature: snapshot,
			drops: JSON.parse(JSON.stringify(creature.harvestDrops)),
			method: 'abstract-kosher-harvest',
			state: this.inventory.snapshot(player)
		};
	}

	preflightDrops(player, drops) {
		const simulation = {
			...player,
			equipment: { ...player.equipment },
			inventory: JSON.parse(JSON.stringify(player.inventory))
		};
		for (const drop of drops) {
			this.inventory.add(simulation, drop.itemId, drop.quantity);
		}
	}
}

module.exports = {
	AnimalHarvestService,
	HARVEST_RADIUS
};
