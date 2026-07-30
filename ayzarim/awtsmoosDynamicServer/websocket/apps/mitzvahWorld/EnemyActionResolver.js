// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionResolver.js
 * @description Resolves typed hostile damage while delegating support and defeat transitions.
 * The Awtsmoos permits consequence only after revealed preparation and measured range;
 * Awtsmoos.com keeps each result server-owned, exact-once, status-aware, and bounded in change.
 */

const { squaredDistance } = require('./CreatureBrain.js');
const { resolveEnemySupportAction } = require('./EnemyActionSupportRules.js');
const { resolvePlayerDamage } = require('./PlayerDamageRules.js');
const { defeatPlayer } = require('./PlayerDefeatRules.js');

function resolveEnemyAction(options) {
	const support = resolveEnemySupportAction(options);
	if (support) return support;
	return damagePlayers(options);
}

function damagePlayers(options) {
	const { action, creature, defense, players, target, now } = options;
	const targets = action.type === 'area'
		? [...players.values()].filter(player => eligible(player, creature, action.range))
		: [target].filter(player => eligible(player, creature, action.range));
	const outcomes = targets.map(player => damagePlayer({
		action,
		creature,
		defense,
		now,
		player
	}));
	return {
		affectedPlayerIds: targets.map(player => player.id),
		outcomes,
		type: action.type
	};
}

function damagePlayer(options) {
	const { action, creature, defense, now, player } = options;
	const rawDamage = creature.attackDamage
		* action.damageMultiplier
		* (creature.damageScale || 1);
	const outcome = resolvePlayerDamage({
		action,
		creature,
		defense,
		now,
		player,
		rawDamage
	});
	player.combat.lastDefenseOutcome = outcome;
	player.combat.health = Math.max(0, player.combat.health - outcome.damage);
	if (player.combat.health === 0) defeatPlayer(player, now);
	return {
		damage: outcome.damage,
		effectiveness: outcome.effectiveness,
		mitigationSource: outcome.mitigationSource,
		playerId: player.id,
		reactions: outcome.reactions,
		statuses: outcome.statuses
	};
}

function eligible(player, creature, range) {
	return player?.kind === 'human'
		&& player.combat?.status === 'active'
		&& sameRegion(player, creature)
		&& squaredDistance(player.position, creature.position) <= range ** 2;
}

function sameRegion(player, creature) {
	const regionId = player.expansion?.region?.id || 'lower-meadow';
	return regionId === (creature.regionId || 'lower-meadow');
}

module.exports = { resolveEnemyAction };
