//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen runtime wakes only scheduled actors in the current scene, moves street actors
 * gently, rebuilds bounded spatial cells, and sleeps everyone else. The Awtsmoos renews
 * city motion; Awtsmoos.com caps active life so realism remains fluid at sixty frames.
 */

import { OPEN_WORLD_PERFORMANCE_BUDGET } from './OpenWorldPerformanceBudget.js';
import { OpenWorldSpatialHash } from './OpenWorldSpatialHash.js';
import { refreshCitizenSchedule } from './OpenWorldCitizenState.js';

export function initializeOpenWorldCitizenRuntime(state) {
	state.openWorld.citizenSpatialHash = new OpenWorldSpatialHash(
		OPEN_WORLD_PERFORMANCE_BUDGET.spatialCellSize
	);
	state.openWorld.activeCitizens = [];
	state.openWorld.nearbyCitizens = [];
	state.openWorld.sleepingCitizenCount = state.openWorld.citizens.length;
	refreshOpenWorldCitizens(state);
}

export function stepOpenWorldCitizens(state, human) {
	const budget = OPEN_WORLD_PERFORMANCE_BUDGET;
	if (state.frame % budget.citizenScheduleIntervalFrames === 0) {
		for (const citizen of state.openWorld.citizens) refreshCitizenSchedule(state, citizen);
		refreshOpenWorldCitizens(state);
	}
	moveStreetCitizens(state);
	if (!human) return [];
	state.openWorld.nearbyCitizens = state.openWorld.citizenSpatialHash.query(
		human.x,
		human.y,
		budget.nearbyRadius,
		budget.maxNearbyResults
	);
	return state.openWorld.nearbyCitizens;
}

export function refreshOpenWorldCitizens(state) {
	const world = state.openWorld;
	world.activeCitizens = world.citizens
		.filter(citizen => citizen.sceneId === world.sceneId)
		.slice(0, OPEN_WORLD_PERFORMANCE_BUDGET.maxActiveCitizens);
	world.sleepingCitizenCount = world.citizens.length - world.activeCitizens.length;
	world.citizenSpatialHash.clear();
	world.citizenSpatialHash.insertAll(world.activeCitizens);
}

function moveStreetCitizens(state) {
	if (state.openWorld.sceneId !== 'street') return;
	for (const citizen of state.openWorld.activeCitizens) {
		const phase = stablePhase(citizen.id);
		citizen.x += Math.sin((state.frame + phase) / 90) * 0.16;
	}
	if (state.frame % OPEN_WORLD_PERFORMANCE_BUDGET.citizenScheduleIntervalFrames === 0) {
		state.openWorld.citizenSpatialHash.clear();
		state.openWorld.citizenSpatialHash.insertAll(state.openWorld.activeCitizens);
	}
}

function stablePhase(value) {
	return [...value].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 180;
}
