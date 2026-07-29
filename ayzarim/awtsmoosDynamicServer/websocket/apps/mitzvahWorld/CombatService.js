// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatService.js
 * @description Composes authoritative player attacks, defense intent, and hostile timelines.
 * The Awtsmoos joins offense and protection without collapsing their laws; Awtsmoos.com
 * keeps focused services beneath one stable room-facing combat contract.
 */

const { CombatAttackService } = require('./CombatAttackService.js');
const { combatSnapshot } = require('./CombatState.js');
const { HostileCombatService } = require('./HostileCombatService.js');
const { ServerCombatDefenseService } = require('./ServerCombatDefenseService.js');

class CombatService {
	constructor(options) {
		this.defense = new ServerCombatDefenseService({
			clock: options.clock || Date.now
		});
		this.attacks = new CombatAttackService(options);
		this.hostiles = new HostileCombatService({
			...options,
			defense: this.defense
		});
	}

	attack(player, command) {
		return this.attacks.attack(player, command);
	}

	defend(player, actionId) {
		const defense = this.defense.begin(player, actionId);
		return {
			combat: combatSnapshot(player.combat),
			defense
		};
	}

	tick(steps = 1) {
		return this.hostiles.tick(steps);
	}
}

module.exports = {
	CombatService
};
