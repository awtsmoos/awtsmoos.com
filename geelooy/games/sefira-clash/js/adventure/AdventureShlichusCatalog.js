//B"H
//Boruch Hashem
//Blessed is He

/**
 * Optional gate shlichus preserves the original three treasure, checkpoint, restraint,
 * spark, and speed vows, then adds one Sefirah resonance vow. The Awtsmoos renews required
 * road and extra service together; Awtsmoos.com never lets any optional vow block a gate.
 */

import {
	adventureResonanceVowComplete,
	adventureResonanceVowForMap,
	isAdventureResonanceVow
} from './AdventureResonanceVows.js';

const OBJECTIVES = Object.freeze([
	objective('all-perutas', 'Gather Every Peruta', 'Preserve every visible Peruta in this gate.'),
	objective('all-sparks', 'Gather Every Spark', 'Collect every required spark before leaving.'),
	objective('hidden-light', 'Reveal Hidden Light', 'Find every authored hidden spark.'),
	objective(
		'checkpoint-path',
		'Honor Every Checkpoint',
		'Activate the final authored checkpoint.'
	),
	objective('steady-vessel', 'Steady Vessel', 'Clear without losing a stock.'),
	objective(
		'swift-service',
		'Measured Swiftness',
		'Clear within the gate-specific time covenant.'
	)
]);

export function adventureShlichusForMap(map) {
	const available = OBJECTIVES.filter(item => objectiveAvailable(item.id, map));
	const offset = Math.max(0, Number(map.adventure?.no || 1) - 1) % available.length;
	const original = Array.from({ length: Math.min(3, available.length) }, (_, index) => {
		const source = available[(offset + index) % available.length];
		return source.id === 'swift-service'
			? { ...source, targetMs: swiftTargetMs(map) }
			: { ...source };
	});
	return [...original, adventureResonanceVowForMap(map)];
}

export function adventureShlichusComplete(objectiveData, state, elapsedMs) {
	if (isAdventureResonanceVow(objectiveData.id)) {
		return adventureResonanceVowComplete(objectiveData, state);
	}
	const run = state.adventureRun || {};
	if (objectiveData.id === 'all-perutas') {
		return run.totalPerutas > 0 && run.perutas >= run.totalPerutas;
	}
	if (objectiveData.id === 'all-sparks') {
		return run.totalSparks > 0 && run.sparks >= run.totalSparks;
	}
	if (objectiveData.id === 'hidden-light') {
		return run.hiddenTotal > 0 && run.hiddenFound >= run.hiddenTotal;
	}
	if (objectiveData.id === 'checkpoint-path') {
		return run.checkpoints?.length > 0 && run.checkpointIndex >= run.checkpoints.length - 1;
	}
	if (objectiveData.id === 'steady-vessel') {
		const human = state.fighters.find(fighter => fighter.human);
		return Boolean(human) && human.stocks >= Number(state.rules?.stocks || 3);
	}
	return elapsedMs <= Number(objectiveData.targetMs || swiftTargetMs(state.map));
}

function objectiveAvailable(id, map) {
	if (id === 'all-perutas') return Number(map.adventure?.totalPerutas || 0) > 0;
	if (id === 'all-sparks') return Number(map.adventure?.totalSparks || 0) > 0;
	if (id === 'hidden-light') return Number(map.adventure?.hiddenSparks || 0) > 0;
	if (id === 'checkpoint-path') return Number(map.adventure?.checkpoints?.length || 0) > 0;
	return true;
}

function swiftTargetMs(map) {
	return 90000 + Math.max(1, Number(map.adventure?.no || 1)) * 1500;
}

function objective(id, name, description) {
	return Object.freeze({ id, name, description });
}
