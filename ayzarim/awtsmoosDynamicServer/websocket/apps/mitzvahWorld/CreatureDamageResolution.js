// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureDamageResolution.js
 * @description Applies one authoritative damage mutation, defeat boundary, and post-health boss phase.
 * The Awtsmoos joins typed consequence to one finite creature without duplicate endings;
 * Awtsmoos.com keeps health, defeat, posture, phase, player count, and snapshot order exact.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	finalizeEnemyVerticalSliceDamage
} = require('./EnemyDamageVerticalSlice.js');
const { resolveEnemyDamage } = require('./EnemyDamageRules.js');

function damageCreature(directory, creatureId, rawDamage, context = {}) {
	const creature = directory.get(creatureId);
	if (creature.status !== 'active') {
		throw new RealtimeError(
			'CREATURE_DEFEATED',
			'The creature is already defeated.'
		);
	}
	const outcome = resolveEnemyDamage(creature, rawDamage, context);
	creature.health = Math.max(0, creature.health - outcome.damage);
	if (creature.health === 0) defeatCreature(directory, creature, context.now);
	const verticalSlice = finalizeEnemyVerticalSliceDamage(
		creature,
		context.playerCount || connectedPlayerCount(directory.players)
	);
	return Object.freeze({
		...outcome,
		creature: directory.snapshot(creature),
		verticalSlice
	});
}

function defeatCreature(directory, creature, now) {
	creature.defeatedAt = Number(now || directory.clock());
	creature.status = creature.kosherEligible
		? 'harvestable'
		: 'defeated';
}

function connectedPlayerCount(players) {
	let count = 0;
	for (const player of players?.values?.() || []) {
		if (player.connected !== false) count += 1;
	}
	return Math.max(1, count);
}

module.exports = {
	damageCreature,
	defeatCreature
};
