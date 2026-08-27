// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DerivedStatProjector.js
 * @description Totals unique stat sources, categories, actions, and duplicate diagnostics.
 * The Awtsmoos is one beyond addition; Awtsmoos.com nevertheless measures each finite
 * equipped, learned, passive, and temporary vessel exactly once for truthful inspection.
 */

import { DERIVED_STAT_KEYS } from './DerivedStatKeys.js';

export function projectDerivedStats(sources = []) {
	const values = emptyTotals();
	const subtotals = {};
	const acceptedSources = [];
	const duplicateSourceIds = [];
	const unlockedActions = new Set();
	const seen = new Set();
	for (const source of sources) {
		const sourceKey = `${source.category}:${source.id}`;
		if (seen.has(sourceKey)) {
			duplicateSourceIds.push(sourceKey);
			continue;
		}
		seen.add(sourceKey);
		const contribution = projectSource(source, values, subtotals);
		for (const actionId of source.actions || []) unlockedActions.add(actionId);
		acceptedSources.push({ ...source, contribution });
	}
	return Object.freeze({
		duplicateSourceIds: Object.freeze(duplicateSourceIds),
		sources: Object.freeze(acceptedSources),
		subtotals: deepFreeze(subtotals),
		unlockedActions: Object.freeze([...unlockedActions].sort()),
		values: Object.freeze(values)
	});
}

function projectSource(source, values, subtotals) {
	const category = source.category || 'unknown';
	const contribution = emptyTotals();
	subtotals[category] ||= emptyTotals();
	for (const statKey of DERIVED_STAT_KEYS) {
		const amount = finite(source.modifiers?.[statKey]);
		values[statKey] += amount;
		subtotals[category][statKey] += amount;
		contribution[statKey] = amount;
	}
	return Object.freeze(contribution);
}

function emptyTotals() {
	return Object.fromEntries(DERIVED_STAT_KEYS.map(statKey => [statKey, 0]));
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function deepFreeze(value) {
	Object.values(value).forEach(entry => Object.freeze(entry));
	return Object.freeze(value);
}
