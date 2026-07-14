// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureDirectory.js
 * @description Owns bounded authoritative animals and fictional spirit encounters.
 * The Awtsmoos renews each creature beyond its visible mesh; Awtsmoos.com keeps
 * health, care, defeat, harvesting, and deterministic movement in one server vessel.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { creatureDefinition } = require('./CombatantCatalog.js');
const { nextCreaturePosition, squaredDistance } = require('./CreatureBrain.js');
const { SPAWNS } = require('./CreatureSpawnCatalog.js');
const CARE_RADIUS = 5;

class CreatureDirectory {
	constructor(players) {
		this.players = players;
		this.step = 0;
		this.creatures = new Map(SPAWNS.map(createCreatureEntry));
	}

	get(creatureId) {
		const creature = this.creatures.get(creatureId);
		if (!creature) throw new RealtimeError('CREATURE_NOT_FOUND', 'The requested creature does not exist.');
		return creature;
	}

	damage(creatureId, damage, now) {
		const creature = this.get(creatureId);
		if (creature.status !== 'active') {
			throw new RealtimeError('CREATURE_DEFEATED', 'The creature is already defeated.');
		}
		creature.health = Math.max(0, creature.health - damage);
		if (creature.health === 0) {
			creature.defeatedAt = now;
			creature.status = creature.kosherEligible ? 'harvestable' : 'defeated';
		}
		return this.snapshot(creature);
	}

	care(player, creatureId) {
		const creature = this.get(creatureId);
		if (creature.kind !== 'animal' || creature.status !== 'active') {
			throw new RealtimeError('CREATURE_NOT_CAREABLE', 'Only a living animal may receive care.');
		}
		if (squaredDistance(player.position, creature.position) > CARE_RADIUS * CARE_RADIUS) {
			throw new RealtimeError('CREATURE_OUT_OF_RANGE', 'Move closer before caring for the animal.');
		}
		const newlyCared = !creature.caredBy.includes(player.id);
		if (newlyCared) creature.caredBy.push(player.id);
		return { creature: this.snapshot(creature), newlyCared };
	}

	tick(steps = 1) {
		for (let index = 0; index < steps; index += 1) {
			this.step += 1;
			for (const creature of this.creatures.values()) {
				creature.position = nextCreaturePosition(creature, this.players, this.step);
			}
		}
		return this.snapshots();
	}

	markHarvested(creatureId, playerId) {
		const creature = this.get(creatureId);
		creature.harvestedBy = playerId;
		creature.status = 'harvested';
		return this.snapshot(creature);
	}

	snapshot(creature) {
		return JSON.parse(JSON.stringify({
			health: creature.health,
			id: creature.id,
			kind: creature.kind,
			maximumHealth: creature.maximumHealth,
			position: creature.position,
			speciesId: creature.speciesId,
			status: creature.status,
			temperament: creature.temperament
		}));
	}

	snapshots() {
		return [...this.creatures.values()].map((creature) => this.snapshot(creature));
	}
}

function createCreatureEntry(spawn) {
	const definition = creatureDefinition(spawn.speciesId);
	const creature = {
		...definition,
		caredBy: [],
		defeatedAt: null,
		harvestedBy: null,
		health: definition.maximumHealth,
		homePosition: { ...spawn.position },
		id: spawn.id,
		lastAttackAt: 0,
		position: { ...spawn.position },
		seed: stableSeed(spawn.id),
		speciesId: spawn.speciesId,
		status: 'active'
	};
	return [creature.id, creature];
}

function stableSeed(value) {
	return [...String(value)].reduce((hash, character) => {
		return Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
	}, 2166136261);
}

module.exports = {
	CARE_RADIUS,
	CreatureDirectory
};
