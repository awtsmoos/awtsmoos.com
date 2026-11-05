// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyCastPresentation.js
 * @description Builds a bounded, readable projection from permitted enemy action insight.
 * The Awtsmoos reveals only earned knowledge while danger remains legible in every hue;
 * Awtsmoos.com keeps three urgent casts, their counters, and their progress faithful and true.
 */

const MAXIMUM_VISIBLE_CASTS = 3;
const DANGER_WEIGHT = Object.freeze({
	critical: 5,
	high: 4,
	control: 3,
	measured: 2,
	support: 1,
	unknown: 0
});

export function enemyCastPresentation(records) {
	return [...records.values()]
		.filter(record => visibleAction(record.action))
		.sort(compareEnemyCasts)
		.slice(0, MAXIMUM_VISIBLE_CASTS)
		.map(record => Object.freeze(presentationRecord(record)));
}

function visibleAction(action) {
	return Boolean(
		action?.id
		&& !['idle', 'interrupted'].includes(action.phase)
	);
}

function compareEnemyCasts(left, right) {
	if (Boolean(left.selected) !== Boolean(right.selected)) {
		return left.selected ? -1 : 1;
	}
	const danger = dangerWeight(right.action) - dangerWeight(left.action);
	if (danger) return danger;
	return String(left.creatureId).localeCompare(String(right.creatureId));
}

function dangerWeight(action) {
	return DANGER_WEIGHT[action?.danger] || 0;
}

function presentationRecord(record) {
	const action = record.action;
	return {
		actionInstanceId: action.actionInstanceId || `${record.creatureId}:${action.id}`,
		counter: action.counterGuidance || null,
		creatureId: record.creatureId,
		danger: action.danger || 'unknown',
		element: action.element || null,
		englishName: action.englishName || action.id,
		hebrewName: action.hebrewName || '',
		interruptResistance: finiteOrNull(action.interruptResistanceRemaining)
			?? finiteOrNull(action.interruptResistance),
		phase: action.phase,
		progress: boundedProgress(action.progress),
		selected: Boolean(record.selected),
		targetId: action.targetId || null
	};
}

function boundedProgress(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return null;
	return Math.max(0, Math.min(1, number));
}

function finiteOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}
