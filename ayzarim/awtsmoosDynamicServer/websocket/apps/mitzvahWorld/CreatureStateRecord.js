// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureStateRecord.js
 * @description Captures and restores authoritative creature life, posture, phase, care, and loot.
 * The Awtsmoos renews each animal and fictional husk beyond process boundaries;
 * Awtsmoos.com preserves health, composure, boss truth, and harvest without transport state.
 */

const { creatureDefinition } = require('./CombatantCatalog.js');
const {
	restoreCreatureVerticalSliceState
} = require('./CreatureVerticalSliceState.js');

function captureCreatureState(directory) {
	return [...directory.creatures.values()].map(creature => clone(creature));
}

function restoreCreatureState(directory, records) {
	if (!Array.isArray(records)) return;
	directory.creatures.clear();
	for (const record of records) {
		const definition = creatureDefinition(record.speciesId);
		if (!definition || !record.id) continue;
		directory.creatures.set(record.id, {
			...definition,
			...clone(record),
			...restoreCreatureVerticalSliceState(record, definition),
			caredBy: Array.isArray(record.caredBy)
				? [...new Set(record.caredBy)]
				: [],
			health: bounded(record.health, 0, definition.maximumHealth),
			homePosition: finitePosition(record.homePosition),
			position: finitePosition(record.position)
		});
	}
}

function finitePosition(position = {}) {
	return {
		x: finite(position.x),
		y: finite(position.y),
		z: finite(position.z)
	};
}

function bounded(value, minimum, maximum) {
	const number = finite(value);
	return Math.max(minimum, Math.min(maximum, number));
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	captureCreatureState,
	restoreCreatureState
};
