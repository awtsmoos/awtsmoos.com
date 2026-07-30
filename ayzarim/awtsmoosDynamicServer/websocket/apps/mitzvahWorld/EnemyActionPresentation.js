// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionPresentation.js
 * @description Projects public warning and observer-specific Daas insight from private action state.
 * The Awtsmoos renews hidden judgment and revealed warning without confusing their gate;
 * Awtsmoos.com lets earned Daas disclose element, progress, counter, and resistance at its state.
 */

const {
	combatInsightTier,
	filterCombatInsight
} = require('./CombatInsightRules.js');
const { enemyAffinityProfile } = require('./CombatDefinitionCatalog.js');
const { ensureEnemyActionState } = require('./EnemyActionState.js');
const { derivedPlayerStats } = require('./PlayerAttributeCatalog.js');

function publicEnemyActionSnapshot(creature) {
	const state = ensureEnemyActionState(creature);
	return clone({
		actionInstanceId: state.actionInstanceId,
		danger: state.danger,
		englishName: state.englishName,
		hebrewName: state.hebrewName,
		id: state.actionId,
		interruptedAt: state.interruptedAt,
		interruptionReason: state.interruptionReason,
		phase: state.phase
	});
}

function observerEnemyActionSnapshot(creature, observer, now = Date.now()) {
	const state = ensureEnemyActionState(creature);
	const stats = derivedPlayerStats(observer);
	const statusIds = Array.isArray(observer.combatStatuses)
		? observer.combatStatuses.map(status => status.id)
		: [];
	const tier = Math.max(
		Number(stats.daasInsightTier || 0),
		combatInsightTier(observer.shliach?.attributes?.daas, statusIds)
	);
	const insight = filterCombatInsight({
		...state,
		id: state.actionId,
		progress: actionProgress(state, now),
		resistanceHint: resistanceHint(creature)
	}, tier);
	return clone({
		...insight,
		actionInstanceId: state.actionInstanceId,
		insightTier: tier,
		interruptedAt: state.interruptedAt,
		interruptionReason: state.interruptionReason,
		phase: state.phase
	});
}

function actionProgress(state, now) {
	if (!state.actionId || !Number.isFinite(Number(state.endsAt))) return null;
	const startedAt = Number(state.telegraphAt || now);
	const duration = Math.max(1, Number(state.endsAt) - startedAt);
	return Math.max(0, Math.min(1, (Number(now) - startedAt) / duration));
}

function resistanceHint(creature) {
	const profile = enemyAffinityProfile(creature.speciesId);
	const entries = Object.entries(profile?.resistances || {});
	if (!entries.length) return null;
	entries.sort((left, right) => right[1] - left[1]);
	return {
		strongestElementId: entries[0][0],
		strongestResistance: entries[0][1],
		weakestElementId: entries.at(-1)[0],
		weakestResistance: entries.at(-1)[1]
	};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	observerEnemyActionSnapshot,
	publicEnemyActionSnapshot
};
