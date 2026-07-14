// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatService.js
 * @description Owns player attack range, cooldown, stamina, damage, and spark repair.
 * The Awtsmoos renews force beneath purpose and restraint; Awtsmoos.com accepts
 * intent while the server alone decides whether an attack reaches, lands, or rewards.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { combatSnapshot } = require('./CombatState.js');
const { weaponDefinition } = require('./CombatantCatalog.js');
const { squaredDistance } = require('./CreatureBrain.js');
const { HostileCombatService } = require('./HostileCombatService.js');

class CombatService {
	constructor(options) {
		this.adventures = options.adventures;
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.inventory = options.inventory;
		this.hostiles = new HostileCombatService(options);
	}

	attack(player, command) {
		this.requireActive(player);
		const creature = this.creatures.get(command.creatureId);
		const weapon = this.requireWeapon(player, command.weaponId);
		this.requireAnimalIntent(creature, weapon, command.intent);
		this.requireRange(player.position, creature.position, weapon.range);
		const now = this.clock();
		if (now - player.combat.lastAttackAt < weapon.cooldownMs) {
			throw new RealtimeError('ATTACK_COOLDOWN', 'The weapon is still recovering.');
		}
		if (player.combat.stamina < weapon.staminaCost) {
			throw new RealtimeError('INSUFFICIENT_STAMINA', 'The player lacks attack stamina.');
		}
		player.combat.lastAttackAt = now;
		player.combat.stamina -= weapon.staminaCost;
		const snapshot = this.creatures.damage(creature.id, weapon.damage, now);
		const adventures = isDefeated(snapshot)
			? this.defeatEvents(player, creature)
			: [];
		return {
			adventures,
			combat: combatSnapshot(player.combat),
			creature: snapshot,
			damage: weapon.damage,
			refinedSparks: player.refinedSparks
		};
	}

	tick(steps = 1) {
		return this.hostiles.tick(steps);
	}

	defeatEvents(player, creature) {
		const events = this.adventures.recordEvent(player, {
			count: 1,
			target: creature.speciesId,
			type: 'defeat'
		});
		if (creature.refinedSparks > 0) {
			player.refinedSparks += creature.refinedSparks;
			events.push(...this.adventures.recordEvent(player, {
				count: creature.refinedSparks,
				target: 'spark',
				type: 'refine'
			}));
		}
		return events;
	}

	requireWeapon(player, weaponId) {
		const weapon = weaponDefinition(weaponId);
		if (!weapon || this.inventory.quantity(player, weaponId) < 1) {
			throw new RealtimeError('WEAPON_NOT_OWNED', 'The requested weapon is not owned.');
		}
		if (player.equipment[weapon.slot] !== weaponId) {
			throw new RealtimeError('WEAPON_NOT_EQUIPPED', 'Equip the requested weapon first.');
		}
		return weapon;
	}

	requireAnimalIntent(creature, weapon, intent) {
		if (creature.kind !== 'animal' || creature.temperament === 'hostile') return;
		if (intent !== 'harvest' || !creature.kosherEligible || weapon.id !== 'chalaf') {
			throw new RealtimeError('ANIMAL_ATTACK_DENIED', 'Pasture animals require explicit eligible harvest intent.');
		}
	}

	requireRange(origin, target, range) {
		if (squaredDistance(origin, target) > range * range) {
			throw new RealtimeError('TARGET_OUT_OF_RANGE', 'Move closer before attacking.');
		}
	}

	requireActive(player) {
		if (player.combat.status !== 'active') {
			throw new RealtimeError('PLAYER_DEFEATED', 'Respawn before attacking again.');
		}
	}
}

function isDefeated(snapshot) {
	return snapshot.status === 'defeated' || snapshot.status === 'harvestable';
}

module.exports = {
	CombatService
};
