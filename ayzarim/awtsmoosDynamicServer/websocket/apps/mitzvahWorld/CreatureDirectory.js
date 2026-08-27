// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureDirectory.js
 * @description Owns creature lookup, damage delegation, care, movement, summoning, and snapshots.
 * The Awtsmoos renews each creature beyond its visible mesh; Awtsmoos.com coordinates
 * focused services while defeat, posture, phase, loot privacy, actions, and movement remain authoritative.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { nextCreaturePosition } = require('./CreatureBrain.js');
const { careForCreature, CARE_RADIUS } = require('./CreatureCareService.js');
const {
	damageCreature,
	defeatCreature
} = require('./CreatureDamageResolution.js');
const { createCreatureEntry } = require('./CreatureRecordFactory.js');
const { creatureSnapshot } = require('./CreatureSnapshot.js');
const { CreatureSummonService } = require('./CreatureSummonService.js');
const { SPAWNS } = require('./CreatureSpawnCatalog.js');

class CreatureDirectory {
	constructor(players, options = {}) {
		this.clock = options.clock || Date.now;
		this.creatures = new Map(SPAWNS.map(createCreatureEntry));
		this.players = players;
		this.step = 0;
		this.summons = new CreatureSummonService(this.creatures);
	}

	get(creatureId) {
		const creature = this.creatures.get(creatureId);
		if (!creature) {
			throw new RealtimeError(
				'CREATURE_NOT_FOUND',
				'The requested creature does not exist.'
			);
		}
		return creature;
	}

	damage(creatureId, rawDamage, context = {}) {
		return damageCreature(this, creatureId, rawDamage, context);
	}

	care(player, creatureId) {
		const creature = this.get(creatureId);
		const newlyCared = careForCreature(player, creature);
		return {
			creature: this.snapshot(creature),
			newlyCared
		};
	}

	tick(steps = 1) {
		for (let index = 0; index < steps; index += 1) {
			this.step += 1;
			const now = this.clock();
			for (const creature of this.creatures.values()) {
				creature.position = nextCreaturePosition(
					creature,
					this.players,
					this.step,
					now
				);
			}
		}
		return this.snapshots();
	}

	summonShades(summoner, count) {
		return this.summons.summonShades(summoner, count);
	}

	markHarvested(creatureId, playerId) {
		const creature = this.get(creatureId);
		creature.harvestedBy = playerId;
		creature.status = 'harvested';
		return this.snapshot(creature);
	}

	snapshot(creature) {
		return creatureSnapshot(creature);
	}

	snapshots() {
		return [...this.creatures.values()].map(creature => {
			return this.snapshot(creature);
		});
	}

	defeat(creature, now) {
		return defeatCreature(this, creature, now);
	}
}

module.exports = {
	CARE_RADIUS,
	CreatureDirectory
};
