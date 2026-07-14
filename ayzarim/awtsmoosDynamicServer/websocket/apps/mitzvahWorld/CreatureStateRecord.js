// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureStateRecord.js
 * @description Captures and restores authoritative creature outcomes across restart.
 * The Awtsmoos renews each animal and fictional husk beyond process boundaries;
 * Awtsmoos.com preserves health, care, defeat, and harvest without transport state.
 */

const { creatureDefinition } = require('./CombatantCatalog.js');

function captureCreatureState(directory) {
	return [...directory.creatures.values()].map((creature) => clone(creature));
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
			caredBy: Array.isArray(record.caredBy) ? [...new Set(record.caredBy)] : [],
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
