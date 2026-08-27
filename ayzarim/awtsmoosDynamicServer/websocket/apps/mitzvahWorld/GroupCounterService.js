// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GroupCounterService.js
 * @description Collects unique authoritative counter force inside a short cooperative window.
 * The Awtsmoos lets many finite intentions join without becoming duplicate force;
 * Awtsmoos.com owns contributor identity, replay tokens, timing, resistance, and completion.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { rememberCombatCooldown } = require('./CombatCooldownRules.js');
const { resolveEnemyInterrupt } = require('./CombatInterruptRules.js');
const { requirePlayerSupportCast } = require('./CombatCastValidation.js');
const {
	activeGroupCounterWindow,
	groupCounterReceipt,
	releasedKavanahResult
} = require('./GroupCounterState.js');
const { playerSupportCast } = require('./PlayerSupportCastCatalog.js');

class GroupCounterService {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.daas = options.daas;
		this.players = options.players;
		this.threat = options.threat;
	}

	contribute(player, command = {}) {
		const now = this.clock();
		const action = requireCounterAction(command.actionId);
		const kavanah = releasedKavanahResult(player, action.id);
		requirePlayerSupportCast(player, {
			...command,
			elapsedMs: kavanah?.elapsedMilliseconds ?? command.elapsedMs
		}, now);
		const creature = this.creatures.get(command.creatureId);
		const window = activeGroupCounterWindow(creature, action.id, now);
		const duplicate = duplicateReason(window, player, command);
		if (duplicate) {
			return groupCounterReceipt(creature, window, false, duplicate);
		}
		player.combat.stamina -= action.staminaCost;
		rememberCombatCooldown(player.combat, action.id, action.cooldownMs, now);
		const force = Number(action.interruptForce || 0)
			* Number(kavanah?.controlMultiplier || 1);
		window.contributors.push(player.id);
		window.tokens.push(command.castInstanceId);
		window.force += force;
		const interruption = resolveWindow(creature, action, window, now, player.id);
		this.rememberLearning(creature, action, window);
		this.threat.add(
			creature,
			player.id,
			'interrupt',
			force,
			command.castInstanceId
		);
		return groupCounterReceipt(
			creature,
			window,
			true,
			interruption ? 'resolved' : 'contributed',
			interruption
		);
	}

	rememberLearning(creature, action, window) {
		if (!window.resolved) return;
		for (const contributorId of window.contributors) {
			const contributor = this.players.get(contributorId);
			if (contributor) {
				this.daas.counter(contributor, creature.id, action.id);
			}
		}
	}
}

function requireCounterAction(actionId) {
	const action = playerSupportCast(actionId);
	if (!action || action.targetKind !== 'enemy-cast') {
		throw new RealtimeError(
			'GROUP_COUNTER_ACTION_REQUIRED',
			'Choose an enemy-cast counter action.'
		);
	}
	return action;
}

function duplicateReason(window, player, command) {
	if (window.tokens.includes(command.castInstanceId)) return 'duplicate-token';
	if (window.contributors.includes(player.id)) return 'duplicate-contributor';
	return null;
}

function resolveWindow(creature, action, window, now, playerId) {
	const threshold = Math.max(1, Number(creature.interruptResistance || 1));
	if (window.force < threshold) return null;
	const interruption = resolveEnemyInterrupt(
		creature,
		{ ...action, interruptForce: window.force },
		now,
		playerId
	);
	window.resolved = Boolean(interruption?.interrupted);
	return interruption;
}

module.exports = {
	GroupCounterService
};
