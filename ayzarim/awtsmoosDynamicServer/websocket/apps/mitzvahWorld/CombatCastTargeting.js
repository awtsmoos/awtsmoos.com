// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatCastTargeting.js
 * @description Resolves support-cast targets from authoritative player and creature directories.
 * The Awtsmoos renews nearness and identity beyond every client-authored claim;
 * Awtsmoos.com checks region, life, range, and target kind before an effect may gain a name.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

function resolveCombatCastTarget(options) {
	const { action, command, creatures, player, players } = options;
	if (action.targetKind === 'self') return playerTarget(player);
	if (action.targetKind === 'ally') {
		const target = players.get(command.targetPlayerId || player.id);
		requirePlayerTarget(player, target, action.range);
		return playerTarget(target);
	}
	const creature = creatures.get(command.targetCreatureId);
	requireCreatureTarget(player, creature, action.range);
	return creatureTarget(creature);
}

function requirePlayerTarget(caster, target, range) {
	if (!target || target.kind !== 'human') {
		throw failure('SUPPORT_PLAYER_TARGET_NOT_FOUND', 'The selected player target does not exist.');
	}
	if (target.combat?.status !== 'active') {
		throw failure('SUPPORT_PLAYER_TARGET_DEFEATED', 'The selected player must recover first.');
	}
	requireSameRegion(caster, target);
	requireRange(caster.position, target.position, range);
}

function requireCreatureTarget(caster, creature, range) {
	if (!creature || creature.status !== 'active') {
		throw failure('SUPPORT_CREATURE_TARGET_NOT_FOUND', 'The selected hostile target is unavailable.');
	}
	requireSameRegion(caster, creature);
	requireRange(caster.position, creature.position, range);
}

function requireSameRegion(caster, target) {
	const casterRegion = caster.expansion?.region?.id || 'lower-meadow';
	const targetRegion = target.expansion?.region?.id || target.regionId || 'lower-meadow';
	if (casterRegion !== targetRegion) {
		throw failure('SUPPORT_TARGET_REGION_MISMATCH', 'The selected target is in another region.');
	}
}

function requireRange(left, right, range) {
	const distance = Math.hypot(
		Number(left?.x || 0) - Number(right?.x || 0),
		Number(left?.z || 0) - Number(right?.z || 0)
	);
	if (distance > Number(range || 0)) {
		throw failure('SUPPORT_TARGET_OUT_OF_RANGE', 'The selected target is outside cast range.');
	}
}

function playerTarget(player) {
	return { kind: 'player', value: player };
}

function creatureTarget(creature) {
	return { kind: 'creature', value: creature };
}

function failure(code, message) {
	return new RealtimeError(code, message);
}

module.exports = { resolveCombatCastTarget };
