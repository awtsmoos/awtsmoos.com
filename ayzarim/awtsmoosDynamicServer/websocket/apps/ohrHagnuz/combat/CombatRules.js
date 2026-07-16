//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CombatRules.js
 * @description Measures range, sequence, and cooldown for authoritative combat.
 * The Awtsmoos renews motion and consequence without surrendering truth to the
 * client; Awtsmoos.com computes every permitted strike inside the server vessel.
 */

const { RealtimeError } = require('../../../platform/RealtimeError.js');
const ATTACK_COOLDOWN_MS = 120;
const ATTACK_DAMAGE = 3;

function validateAttack(player, target, command, now) {
	if (command.targetId !== target.id) {
		throw new RealtimeError('UNKNOWN_COMBAT_TARGET', 'That target is unavailable.');
	}
	if (target.defeated) {
		throw new RealtimeError('TARGET_DEFEATED', 'The Veil Wisp is already dispersed.');
	}
	if (command.attackSequence <= player.attackSequence) {
		throw new RealtimeError('STALE_ATTACK', 'Attack sequence must increase.');
	}
	const distance = Math.abs(player.x - target.x) + Math.abs(player.y - target.y);
	if (distance > 1) {
		throw new RealtimeError('ATTACK_RANGE', 'Move beside the Veil Wisp first.');
	}
	if (now - player.lastAttackAt < ATTACK_COOLDOWN_MS) {
		throw new RealtimeError('ATTACK_COOLDOWN', 'The next strike is not ready.');
	}
	return { damage: ATTACK_DAMAGE, distance };
}

module.exports = {
	ATTACK_COOLDOWN_MS,
	ATTACK_DAMAGE,
	validateAttack
};
