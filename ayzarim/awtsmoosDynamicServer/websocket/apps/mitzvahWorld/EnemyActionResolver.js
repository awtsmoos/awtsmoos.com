// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionResolver.js
 * @description Resolves typed enemy damage, guard, movement, healing, summons, and enrage.
 * The Awtsmoos permits consequence only after revealed preparation; Awtsmoos.com keeps
 * every result server-owned, exact-once, bounded, defensive-aware, status-aware, and cancellable.
 */

const { squaredDistance } = require('./CreatureBrain.js');
const {
	applyCombatStatus,
	clearCombatStatuses
} = require('./CombatStatusRules.js');
const { resolvePlayerDamage } = require('./PlayerDamageRules.js');

function resolveEnemyAction(options) {
	const { action, creature, creatures, defense, players, target, now } = options;
	if (action.type === 'guard') return guard(creature, action, now);
	if (action.type === 'dodge' || action.type === 'retreat') {
		return reposition(creature, target, action.type);
	}
	if (action.type === 'heal') return heal(creature, action, now);
	if (action.type === 'summon') return summon(creature, creatures, action);
	if (action.type === 'enrage') return enrage(creature, action);
	return damagePlayers({ action, creature, defense, players, target, now });
}

function damagePlayers({ action, creature, defense, players, target, now }) {
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

function damagePlayer({ action, creature, defense, now, player }) {
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
	if (player.combat.health === 0) defeat(player, now);
	return {
		damage: outcome.damage,
		effectiveness: outcome.effectiveness,
		mitigationSource: outcome.mitigationSource,
		playerId: player.id,
		reactions: outcome.reactions,
		statuses: outcome.statuses
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

function heal(creature, action, now) {
	creature.health = Math.min(creature.maximumHealth, creature.health + action.healing);
	for (const statusId of action.applyStatusIds || []) {
		applyCombatStatus(creature, statusId, {
			now,
			sourceActionId: action.canonicalActionId || action.id,
			sourceActorId: creature.id
		});
	}
	return { healing: action.healing, type: 'heal' };
}

function summon(creature, creatures, action) {
	return {
		creatureIds: creatures.summonShades(creature, action.summonCount),
		type: 'summon'
	};
}

function enrage(creature, action) {
	creature.damageScale = action.damageScale;
	creature.enraged = true;
	creature.phase = 'burning-letters';
	creature.phaseAffinityId = action.affinityId;
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
	clearCombatStatuses(player.combat);
	player.combat.defeatedAt = now;
	player.combat.guardUntil = null;
	player.combat.parryUntil = null;
	player.combat.status = 'defeated';
}

module.exports = { resolveEnemyAction };
