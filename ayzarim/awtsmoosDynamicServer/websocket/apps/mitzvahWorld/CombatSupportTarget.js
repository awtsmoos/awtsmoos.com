// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatSupportTarget.js
 * @description Resolves self, ally, enemy, and enemy-cast targets with authoritative range checks.
 * The Awtsmoos gives every compassionate or restraining deed its lawful address;
 * Awtsmoos.com rejects missing, defeated, distant, and invented targets before effect descends.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

function resolveCombatSupportTarget(options) {
	const { action, caster, command, creatures, players } = options;
	if (action.targetKind === 'self') {
		return Object.freeze({ kind: 'player', value: caster });
	}
	if (action.targetKind === 'ally') {
		const target = players.get(command.targetPlayerId);
		if (!target) fail('PLAYER_NOT_FOUND', 'The support target does not exist.');
		if (target.combat.status !== 'active') {
			fail('TARGET_DEFEATED', 'Revive the target before ordinary support.');
		}
		requireRange(caster.position, target.position, action.range);
		return Object.freeze({ kind: 'player', value: target });
	}
	const creature = creatures.get(command.creatureId);
	requireRange(caster.position, creature.position, action.range || 18);
	return Object.freeze({ kind: 'creature', value: creature });
}

function requireRange(origin, target, maximum) {
	const distance = Math.hypot(
		Number(target.x || 0) - Number(origin.x || 0),
		Number(target.y || 0) - Number(origin.y || 0),
		Number(target.z || 0) - Number(origin.z || 0)
	);
	if (distance > Math.max(0, Number(maximum || 0)) + 0.5) {
		fail('SUPPORT_TARGET_OUT_OF_RANGE', 'The support target is outside authoritative range.');
	}
}

function fail(code, message) {
	throw new RealtimeError(code, message);
}

module.exports = {
	resolveCombatSupportTarget
};
