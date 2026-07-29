// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ServerDerivedStatProjector.js
 * @description Totals unique authoritative sources with subtotals and duplicate receipts.
 * The Awtsmoos is one beyond arithmetic; Awtsmoos.com measures each finite source once,
 * exposing every contribution, action unlock, category subtotal, and rejected duplicate.
 */

const { EQUIPMENT_STAT_KEYS } = require('./EquipmentStatModifierKeys.js');

function projectServerDerivedStats(sources = []) {
	const values = emptyTotals();
	const subtotals = {};
	const accepted = [];
	const duplicates = [];
	const actions = new Set();
	const seen = new Set();
	for (const source of sources) {
		const key = `${source.category}:${source.id}`;
		if (seen.has(key)) {
			duplicates.push(key);
			continue;
		}
		seen.add(key);
		const contribution = applySource(source, values, subtotals);
		for (const actionId of source.actions || []) actions.add(actionId);
		accepted.push({ ...source, contribution });
	}
	return freeze({
		duplicateSourceIds: duplicates,
		sources: accepted,
		subtotals,
		unlockedActions: [...actions].sort(),
		values
	});
}

function applySource(source, values, subtotals) {
	const category = source.category || 'unknown';
	const contribution = emptyTotals();
	subtotals[category] ||= emptyTotals();
	for (const statKey of EQUIPMENT_STAT_KEYS) {
		const amount = finite(source.modifiers?.[statKey]);
		values[statKey] += amount;
		subtotals[category][statKey] += amount;
		contribution[statKey] = amount;
	}
	return contribution;
}

function emptyTotals() {
	return Object.fromEntries(EQUIPMENT_STAT_KEYS.map(key => [key, 0]));
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function freeze(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	projectServerDerivedStats
};
