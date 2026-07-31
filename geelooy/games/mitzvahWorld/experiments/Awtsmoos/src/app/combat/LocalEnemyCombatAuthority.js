// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalEnemyCombatAuthority.js
 * @description Resolves solo impacts through canonical affinity, statuses, guard, posture, and health.
 * The Awtsmoos renews one law beneath connected and solitary play alike;
 * Awtsmoos.com lets local consequence mirror authority without accepting a forged strike.
 */

import {
	enemyAffinityProfile,
	playerCombatDefinition
} from '../../gameplay/affinity/CombatDefinitionCatalog.js';
import {
	resolveCombatEffectiveness
} from '../../gameplay/affinity/CombatEffectivenessResolver.js';

export function resolveLocalEnemyCombatImpact(options) {
	const action = playerCombatDefinition(options.actionId);
	if (!action) throw new Error('UNKNOWN_COMBAT_ACTION');
	const actor = options.actor;
	const profile = enemyAffinityProfile(profileId(actor));
	const effectiveness = resolveCombatEffectiveness({
		action,
		baseDamage: localBaseDamage(options.runtime, options.localAction),
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
	const damageResult = actor.applyDamage(effectiveness.damage, {
		action,
		actionId: action.id,
		effectiveness,
		localAction: options.localAction,
		stagger: options.localAction?.stagger
	});
	return {
		...damageResult,
		action: actionReceipt(action),
		effectiveness: effectivenessReceipt(effectiveness),
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
	if (/cast/.test(actor.action || '')) tags.push('channeling');
	if (actor.airborne) tags.push('airborne');
	if (actor.hidden) tags.push('hidden');
	if (actor.defense?.value === 0) tags.push('posture-broken');
	return tags;
}

function actionReceipt(action) {
	return {
		affinityId: action.affinityId,
		elementId: action.elementId,
		id: action.id
	};
}

function effectivenessReceipt(value) {
	return {
		baseDamage: value.baseDamage,
		criticalInteraction: value.criticalInteraction,
		diagnostics: [...value.diagnostics],
		finalDamage: value.damage,
		multiplier: value.multiplier
	};
}
