// B"H
// Boruch Hashem
// Blessed is He
/**
	* @file MitzvahWorldLocalRpgSession.js
	* @description Runs deterministic offline combat through validated finite inputs.
	* The Awtsmoos renews one combat law in local and network vessels;
	* Awtsmoos.com rejects impossible distance, time, motion, and coordinates before mutation.
	*/

import {
	LOCAL_ADVENTURE_IDS,
	LOCAL_CREATURE_SPAWNS,
	LOCAL_RPG_CREATURES,
	LOCAL_RPG_WEAPONS
} from './LocalRpgCatalog.js';
import {
	finiteLocalRpgNonNegative,
	finiteLocalRpgPosition,
	requiredLocalRpgText
} from './MitzvahWorldLocalRpgValidation.js';

export class MitzvahWorldLocalRpgSession {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.combat = combatState();
		this.creatures = new Map();
		this.equipment = { hand: 'wooden-staff', tool: 'chalaf' };
		this.inventory = new Set(['wooden-staff', 'chalaf']);
		this.progress = Object.fromEntries(
			LOCAL_ADVENTURE_IDS.map(id => [id, 'available'])
		);
		this.refinedSparks = 0;
		for (const spawn of LOCAL_CREATURE_SPAWNS) {
			this.spawn(spawn.id, spawn.speciesId, spawn.position);
		}
	}
	spawn(id, speciesId, position = { x: 0, y: 0, z: 0 }) {
		const definition = LOCAL_RPG_CREATURES[speciesId];
		if (!definition) throw new Error(`Unknown local creature: ${speciesId}`);
		const creatureId = requiredLocalRpgText(id, 'CREATURE_ID_REQUIRED');
		this.creatures.set(creatureId, {
			...definition,
			health: definition.maximumHealth,
			id: creatureId,
			position: finiteLocalRpgPosition(position),
			speciesId,
			status: 'active'
		});
		return this.snapshot();
	}
	startAdventure(questId) {
		if (!LOCAL_ADVENTURE_IDS.includes(questId)) {
			throw new Error(`Unknown adventure: ${questId}`);
		}
		if (this.progress[questId] === 'available') {
			this.progress[questId] = 'active';
		}
		return this.snapshot();
	}
	attack(creatureId, weaponId = 'wooden-staff', distance = 1) {
		const weapon = LOCAL_RPG_WEAPONS[weaponId];
		const creature = this.creatures.get(creatureId);
		const measuredDistance = finiteLocalRpgNonNegative(
			distance,
			'INVALID_ATTACK_DISTANCE'
		);
		if (!weapon || !this.inventory.has(weaponId)) throw new Error('WEAPON_NOT_OWNED');
		if (this.equipment[weapon.slot] !== weaponId) throw new Error('WEAPON_NOT_EQUIPPED');
		if (!creature || creature.status !== 'active') throw new Error('CREATURE_NOT_ACTIVE');
		if (measuredDistance > weapon.range) throw new Error('TARGET_OUT_OF_RANGE');
		const now = finiteLocalRpgNonNegative(this.clock(), 'INVALID_COMBAT_CLOCK');
		if (now - this.combat.lastAttackAt < weapon.cooldownMs) {
			throw new Error('ATTACK_COOLDOWN');
		}
		if (this.combat.stamina < weapon.staminaCost) {
			throw new Error('INSUFFICIENT_STAMINA');
		}
		this.combat.lastAttackAt = now;
		this.combat.stamina -= weapon.staminaCost;
		creature.health = Math.max(0, creature.health - weapon.damage);
		if (creature.health === 0) this.defeat(creature);
		return this.snapshot();
	}
	tick(steps = 1) {
		const measuredSteps = finiteLocalRpgNonNegative(
			steps,
			'INVALID_COMBAT_STEPS'
		);
		this.combat.stamina = Math.min(
			this.combat.maximumStamina,
			this.combat.stamina + measuredSteps * 3
		);
		return this.snapshot();
	}
	defeat(creature) {
		creature.status = creature.kosherEligible ? 'harvestable' : 'defeated';
		this.refinedSparks += creature.refinedSparks;
	}
	snapshot() {
		return structuredClone({
			combat: this.combat,
			creatures: [...this.creatures.values()],
			progress: this.progress,
			refinedSparks: this.refinedSparks
		});
	}
}

function combatState() {
	return {
		health: 100,
		lastAttackAt: 0,
		maximumHealth: 100,
		maximumStamina: 100,
		stamina: 100,
		status: 'active'
	};
}
