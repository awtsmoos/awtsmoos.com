// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VerticalSliceCombatService.js
 * @description Composes server Kavanah, support, group counters, Daas, threat, and boss rewards.
 * The Awtsmoos unites focused laws without collapsing their boundaries; Awtsmoos.com
 * gives the room one authoritative contract for intention, knowledge, attention, and reward.
 */

const { CombatSupportService } = require('./CombatSupportService.js');
const { DaasKnowledgeService } = require('./DaasKnowledgeService.js');
const { GroupCounterService } = require('./GroupCounterService.js');
const { KavanahService } = require('./KavanahService.js');
const { playerVerticalSliceSnapshot } = require('./PlayerVerticalSliceState.js');
const { ThreatService } = require('./ThreatService.js');
const { VerticalSliceAttackService } = require('./VerticalSliceAttackService.js');

class VerticalSliceCombatService {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.players = options.players;
		this.kavanah = new KavanahService({ clock: this.clock });
		this.daas = new DaasKnowledgeService(options.room || null);
		this.threat = new ThreatService({ clock: this.clock });
		const shared = {
			clock: this.clock,
			creatures: this.creatures,
			daas: this.daas,
			kavanah: this.kavanah,
			players: this.players,
			threat: this.threat
		};
		this.support = new CombatSupportService(shared);
		this.groupCounter = new GroupCounterService(shared);
		this.attacks = new VerticalSliceAttackService({
			...shared,
			inventory: options.inventory
		});
	}

	startKavanah(player, payload) {
		return this.kavanah.start(player, payload);
	}

	moveKavanah(player, payload) {
		return this.kavanah.move(player, payload);
	}

	releaseKavanah(player, payload) {
		return this.kavanah.release(player, payload);
	}

	cancelKavanah(player, reason) {
		return this.kavanah.cancel(player, reason);
	}

	stabilizeKavanah(player, strength) {
		return this.kavanah.stabilize(player, strength);
	}

	disruptKavanah(player, damage) {
		return this.kavanah.disrupt(player, damage);
	}

	castSupport(player, command) {
		return this.support.cast(player, command);
	}

	contributeGroupCounter(player, command) {
		return this.groupCounter.contribute(player, command);
	}

	afterAttack(player, creature, action, damage, command) {
		return this.attacks.resolve(
			player,
			creature,
			action,
			damage,
			command
		);
	}

	snapshot(player) {
		return Object.freeze({
			...playerVerticalSliceSnapshot(player),
			kavanah: this.kavanah.snapshot(player)
		});
	}

	bossSnapshot(creatureId) {
		const creature = this.creatures.get(creatureId);
		return this.creatures.snapshot(creature).boss;
	}
}

module.exports = {
	VerticalSliceCombatService
};
