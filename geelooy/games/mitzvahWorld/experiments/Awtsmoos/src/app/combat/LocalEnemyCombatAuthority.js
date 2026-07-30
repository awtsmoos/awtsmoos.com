// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalEnemyCombatAuthority.js
 * @description Resolves solo enemy impacts through canonical affinity, resistance, and status truth.
 * The Awtsmoos renews one law beneath connected and solitary play alike;
 * Awtsmoos.com lets local consequence mirror authority without accepting a forged strike.
 */
import {
	enemyAffinityProfile,
	playerCombatDefinition
} from '../../gameplay/affinity/CombatDefinitionCatalog.js';
import { resolveCombatEffectiveness } from '../../gameplay/affinity/CombatEffectivenessResolver.js';

export function resolveLocalEnemyCombatImpact(options) {
	const action = playerCombatDefinition(options.actionId);
	if (!action) throw new Error('UNKNOWN_COMBAT_ACTION');
	const actor = options.actor;
	const profile = enemyAffinityProfile(profileId(actor));
	const baseDamage = localBaseDamage(options.runtime, options.localAction);
	const effectiveness = resolveCombatEffectiveness({
		action,
		baseDamage,
		contextTags: contextTags(actor),
		statusIds: actor.statusLedger?.ids?.() || [],
		targetResistances: profile?.resistances || {},
		targetTags: actor.profile?.tags || []
	});
	const removed = actor.statusLedger?.removeMany?.(
		effectiveness.removeStatusIds
	) || [];
	const applied = effectiveness.applyStatusIds
		.map(statusId => actor.statusLedger?.apply?.(statusId, {
			sourceActionId: action.id,
			sourceActorId: options.sourceActorId || 'player'
		}))
		.filter(Boolean);
	const damageResult = actor.applyDamage(effectiveness.damage);
	return {
		...damageResult,
		action: {
			affinityId: action.affinityId,
			elementId: action.elementId,
			id: action.id
		},
		effectiveness: {
			baseDamage: effectiveness.baseDamage,
			criticalInteraction: effectiveness.criticalInteraction,
			diagnostics: [...effectiveness.diagnostics],
			finalDamage: effectiveness.damage,
			multiplier: effectiveness.multiplier
		},
		statuses: {
			applied,
			current: actor.statusLedger?.snapshot?.() || [],
			removed
		}
	};
}

function localBaseDamage(runtime, localAction = {}) {
	if (Number.isFinite(localAction.damage)) {
		return Math.max(0, Number(localAction.damage));
	}
	const base = runtime?.derivedStats?.snapshot?.().values?.baseDamage || 12;
	const multiplier = Number(localAction.baseDamageMultiplier || 1);
	return Math.max(1, Math.round(base * multiplier));
}

function profileId(actor) {
	return actor.profile?.affinityProfileId
		|| actor.profile?.speciesId
		|| actor.profile?.id
		|| 'dybbuk-shade';
}

function contextTags(actor) {
	const tags = [];
	if (actor.action === 'cast') tags.push('channeling');
	if (actor.airborne) tags.push('airborne');
	if (actor.hidden) tags.push('hidden');
	return tags;
}
