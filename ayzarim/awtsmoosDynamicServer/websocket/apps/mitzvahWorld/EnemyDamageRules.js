// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyDamageRules.js
 * @description Resolves canonical damage, guard, affinity, statuses, Kavanah control, posture, and payoff.
 * The Awtsmoos renews every strike through context that the server alone may see;
 * Awtsmoos.com keeps resistance, setup, duration, guard, composure, and diagnostics authoritative.
 */

const {
	enemyAffinityProfile,
	playerCombatDefinition
} = require('./CombatDefinitionCatalog.js');
const {
	resolveCombatEffectiveness
} = require('./CombatEffectivenessResolver.js');
const {
	applyCombatReactions,
	combatStatusIds,
	combatStatusSnapshot
} = require('./CombatStatusRules.js');
const {
	kavanahStatusDuration
} = require('./CombatAttackKavanah.js');
const {
	resolveEnemyVerticalSliceDamage
} = require('./EnemyDamageVerticalSlice.js');
const {
	breakLegacyGuard,
	legacyGuardActive,
	resolveLegacyEnemyDamage
} = require('./EnemyLegacyDamageRules.js');

function resolveEnemyDamage(creature, rawDamage, context = {}) {
	const action = context.action
		|| playerCombatDefinition(context.actionId);
	if (!action) {
		return resolveLegacyEnemyDamage(creature, rawDamage, context);
	}
	const now = Number(context.now ?? Date.now());
	const guarded = legacyGuardActive(creature, now);
	const profile = enemyAffinityProfile(creature.speciesId);
	const effectiveness = resolveCombatEffectiveness({
		action,
		baseDamage: rawDamage,
		contextTags: context.serverContextTags || [],
		statusIds: combatStatusIds(creature, now),
		targetResistances: profile?.resistances,
		targetTags: targetTags(creature, guarded)
	});
	const guardBroken = guarded
		&& action.tags?.includes('guard-break');
	if (guardBroken) breakLegacyGuard(creature, now);
	const reactions = applyCombatReactions(creature, effectiveness, {
		durationMs: kavanahStatusDuration(
			effectiveness.applyStatusIds,
			context.kavanah
		),
		now,
		sourceActionId: action.canonicalActionId || action.id,
		sourceActorId: context.sourceActorId
	});
	const vertical = resolveEnemyVerticalSliceDamage(
		creature,
		action,
		rawDamage,
		context
	);
	return Object.freeze({
		affinityId: action.affinityId,
		damage: Math.max(
			0,
			Math.round(effectiveness.damage * vertical.damageMultiplier)
		),
		damageType: action.kind === 'cast'
			? 'spiritual'
			: 'physical',
		effectiveness,
		elementId: action.elementId,
		guardBroken,
		guarded,
		posture: vertical.posture,
		reaction: vertical.reaction,
		reactions,
		resistance: effectiveness.resistance,
		statuses: combatStatusSnapshot(creature, now)
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
	if (creature.posture?.value === 0) tags.push('posture-broken');
	return tags;
}

module.exports = {
	resolveEnemyDamage
};
