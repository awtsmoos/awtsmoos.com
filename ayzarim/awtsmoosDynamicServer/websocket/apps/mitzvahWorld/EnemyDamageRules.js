// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyDamageRules.js
 * @description Resolves typed elemental damage, legacy damage, guard, and bounded reactions.
 * The Awtsmoos renews every strike through context that the server alone may see;
 * Awtsmoos.com keeps resistance, guard, status, and diagnostics authoritative and free.
 */

const {
	enemyAffinityProfile,
	playerCombatDefinition
} = require('./CombatDefinitionCatalog.js');
const { resolveCombatEffectiveness } = require('./CombatEffectivenessResolver.js');
const {
	applyCombatReactions,
	combatStatusIds,
	combatStatusSnapshot
} = require('./CombatStatusRules.js');
const { enemyRole } = require('./EnemyRoleCatalog.js');

function resolveEnemyDamage(creature, rawDamage, context = {}) {
	const action = context.action || playerCombatDefinition(context.actionId);
	if (!action) return resolveLegacyDamage(creature, rawDamage, context);
	const now = Number(context.now ?? Date.now());
	const guarded = guardActive(creature, now);
	const profile = enemyAffinityProfile(creature.speciesId);
	const effectiveness = resolveCombatEffectiveness({
		action,
		baseDamage: rawDamage,
		contextTags: context.serverContextTags || [],
		statusIds: combatStatusIds(creature, now),
		targetResistances: profile?.resistances,
		targetTags: targetTags(creature, guarded)
	});
	const guardBroken = guarded && action.tags?.includes('guard-break');
	if (guardBroken) breakGuard(creature, now);
	const reactions = applyCombatReactions(creature, effectiveness, {
		now,
		sourceActionId: action.canonicalActionId || action.id,
		sourceActorId: context.sourceActorId
	});
	return Object.freeze({
		affinityId: action.affinityId,
		damage: effectiveness.damage,
		damageType: action.kind === 'cast' ? 'spiritual' : 'physical',
		effectiveness,
		elementId: action.elementId,
		guardBroken,
		guarded,
		reactions,
		resistance: effectiveness.resistance,
		statuses: combatStatusSnapshot(creature, now)
	});
}

function resolveLegacyDamage(creature, rawDamage, context) {
	const role = enemyRole(creature.speciesId);
	const damageType = context.kind === 'cast' ? 'spiritual' : 'physical';
	const resistance = Number(role.resistances[damageType] || 0);
	const guardBreak = context.actionId === 'staff-shove';
	const guarded = !guardBreak && guardActive(creature, context.now);
	let multiplier = 1 - resistance;
	if (guarded) multiplier *= 1 - Number(creature.guardStrength || 0);
	if (guardBreak) multiplier *= 1 + Number(role.weaknesses.guardBreak || 0);
	const damage = Math.max(0, Math.round(Number(rawDamage || 0) * multiplier));
	if (guardBreak) breakGuard(creature, context.now);
	return Object.freeze({
		damage,
		damageType,
		guardBroken: guardBreak,
		guarded,
		resistance
	});
}

function targetTags(creature, guarded) {
	const tags = [];
	if (guarded) tags.push('guarded');
	if (creature.airborne === true) tags.push('airborne');
	if (creature.concealed === true) tags.push('hidden');
	if (['telegraph', 'active'].includes(creature.actionState?.phase)) {
		tags.push('channeling');
	}
	return tags;
}

function guardActive(creature, now) {
	return Number.isFinite(creature.guardUntil)
		&& Number(now) <= creature.guardUntil;
}

function breakGuard(creature, now) {
	creature.guardStrength = 0;
	creature.guardUntil = null;
	creature.staggeredUntil = Number(now) + 900;
}

module.exports = { resolveEnemyDamage };
