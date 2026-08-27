// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VerticalSliceAttackService.js
 * @description Closes attack-side threat, Daas learning, boss memory, and exact-once reward law.
 * The Awtsmoos lets consequence become earned knowledge without duplicating treasure;
 * Awtsmoos.com records damage, interruption, posture, phase, mastery, and claim in one receipt.
 */

const {
	KEDEM_WARDEN_ID
} = require('./KedemWardenRules.js');
const {
	grantMeasuredIntent
} = require('./VerticalSliceRewardRules.js');

class VerticalSliceAttackService {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.daas = options.daas;
		this.inventory = options.inventory;
		this.threat = options.threat;
	}

	resolve(player, creature, action, damage, command = {}) {
		const threat = this.threat.add(
			creature,
			player.id,
			damage.interruption?.interrupted ? 'interrupt' : 'damage',
			damage.damage,
			command.impactToken
		);
		const learning = damage.interruption?.interrupted
			? this.daas.counter(player, creature.id, action.id)
			: this.daas.observe(player, creature.id, action.id);
		const boss = rememberBossProgress(player, creature, damage.verticalSlice?.boss);
		const reward = defeatedKedem(creature)
			? grantMeasuredIntent(player, this.inventory, this.clock())
			: null;
		if (reward?.accepted) {
			this.daas.master(player, creature.id, action.id);
		}
		return Object.freeze({
			boss,
			learning,
			reward,
			threat
		});
	}
}

function rememberBossProgress(player, creature, bossReceipt) {
	if (creature.speciesId !== KEDEM_WARDEN_ID || !bossReceipt) return null;
	player.bossProgress ||= {};
	player.bossProgress.kedemWarden = {
		...(player.bossProgress.kedemWarden || {}),
		defeated: Boolean(bossReceipt.defeated),
		phase: Number(bossReceipt.phase || 1),
		rewardClaimId: 'vertical-slice:kedem-warden:first-clear',
		startedAt: Number(player.bossProgress.kedemWarden?.startedAt || Date.now())
	};
	return Object.freeze({
		...bossReceipt,
		creatureId: creature.id
	});
}

function defeatedKedem(creature) {
	return creature.speciesId === KEDEM_WARDEN_ID
		&& ['defeated', 'harvestable'].includes(creature.status);
}

module.exports = {
	VerticalSliceAttackService
};
