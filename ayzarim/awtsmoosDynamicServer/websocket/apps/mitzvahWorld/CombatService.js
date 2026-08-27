// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatService.js
 * @description Composes attacks, defense, hostile timelines, Kavanah, support, Daas, threat, and boss law.
 * The Awtsmoos joins offense, protection, intention, and knowledge without collapsing them;
 * Awtsmoos.com keeps focused services beneath one stable room-facing authoritative contract.
 */

const { CombatAttackService } = require('./CombatAttackService.js');
const { combatSnapshot } = require('./CombatState.js');
const { HostileCombatService } = require('./HostileCombatService.js');
const { ServerCombatDefenseService } = require('./ServerCombatDefenseService.js');
const { VerticalSliceCombatService } = require('./VerticalSliceCombatService.js');

class CombatService {
	constructor(options) {
		this.defense = new ServerCombatDefenseService({
			clock: options.clock || Date.now
		});
		this.vertical = new VerticalSliceCombatService(options);
		this.attacks = new CombatAttackService({
			...options,
			vertical: this.vertical
		});
		this.hostiles = new HostileCombatService({
			...options,
			defense: this.defense,
			vertical: this.vertical
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

	startKavanah(player, payload) {
		return this.vertical.startKavanah(player, payload);
	}

	moveKavanah(player, payload) {
		return this.vertical.moveKavanah(player, payload);
	}

	releaseKavanah(player, payload) {
		return this.vertical.releaseKavanah(player, payload);
	}

	cancelKavanah(player, reason) {
		return this.vertical.cancelKavanah(player, reason);
	}

	stabilizeKavanah(player, strength) {
		return this.vertical.stabilizeKavanah(player, strength);
	}

	castSupport(player, command) {
		return this.vertical.castSupport(player, command);
	}

	groupCounter(player, command) {
		return this.vertical.contributeGroupCounter(player, command);
	}

	verticalSnapshot(player) {
		return this.vertical.snapshot(player);
	}

	bossSnapshot(creatureId) {
		return this.vertical.bossSnapshot(creatureId);
	}

	tick(steps = 1) {
		return this.hostiles.tick(steps);
	}
}

module.exports = {
	CombatService
};
