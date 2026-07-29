// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionResolver.js
 * @description Resolves enemy damage, guard, movement, healing, summons, and enrage.
 * The Awtsmoos permits consequence only after revealed preparation; Awtsmoos.com keeps
 * every result server-owned, exact-once, bounded, defensive-aware, and safely cancellable.
 */

const { squaredDistance } = require('./CreatureBrain.js');

function resolveEnemyAction(options) {
	const { action, creature, creatures, defense, players, target, now } = options;
	if (action.type === 'guard') return guard(creature, action, now);
	if (action.type === 'dodge' || action.type === 'retreat') {
		return reposition(creature, target, action.type);
	}
	if (action.type === 'heal') return heal(creature, action);
	if (action.type === 'summon') return summon(creature, creatures, action);
	if (action.type === 'enrage') return enrage(creature, action);
	return damagePlayers({ action, creature, defense, players, target, now });
}

function damagePlayers({ action, creature, defense, players, target, now }) {
	const targets = action.type === 'area'
		? [...players.values()].filter(player => eligible(player, creature, action.range))
		: [target].filter(player => eligible(player, creature, action.range));
	for (const player of targets) {
		const rawDamage = creature.attackDamage
			* action.damageMultiplier
			* (creature.damageScale || 1);
		const outcome = defense.resolve(player, creature, rawDamage, now);
		player.combat.lastDefenseOutcome = outcome;
		player.combat.health = Math.max(0, player.combat.health - outcome.damage);
		if (player.combat.health === 0) defeat(player, now);
	}
	return {
		affectedPlayerIds: targets.map(player => player.id),
		type: action.type
	};
}

function guard(creature, action, now) {
	creature.guardStrength = action.guardStrength;
	creature.guardUntil = now + action.activeMs + action.recoveryMs;
	return { type: 'guard' };
}

function reposition(creature, target, type) {
	const direction = type === 'retreat' ? -1 : 1;
	const dx = target.position.z - creature.position.z;
	const dz = creature.position.x - target.position.x;
	const length = Math.hypot(dx, dz) || 1;
	creature.position.x += dx / length * 2.4 * direction;
	creature.position.z += dz / length * 2.4 * direction;
	return { type };
}

function heal(creature, action) {
	creature.health = Math.min(
		creature.maximumHealth,
		creature.health + action.healing
	);
	return { healing: action.healing, type: 'heal' };
}

function summon(creature, creatures, action) {
	const creatureIds = creatures.summonShades(
		creature,
		action.summonCount
	);
	return { creatureIds, type: 'summon' };
}

function enrage(creature, action) {
	creature.damageScale = action.damageScale;
	creature.enraged = true;
	creature.phase = 'burning-letters';
	return { phase: creature.phase, type: 'enrage' };
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

function defeat(player, now) {
	player.combat.defeatedAt = now;
	player.combat.guardUntil = null;
	player.combat.parryUntil = null;
	player.combat.status = 'defeated';
}

module.exports = {
	resolveEnemyAction
};
