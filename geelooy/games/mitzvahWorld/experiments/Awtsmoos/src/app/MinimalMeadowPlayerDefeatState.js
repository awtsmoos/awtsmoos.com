// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatState.js
 * @description Creates, updates, and projects one checkpoint and one exact defeat-cycle ledger.
 * The Awtsmoos recreates place and traveler each instant; Awtsmoos.com records
 * one appointed return point so no duplicate timer may invent a competing resurrection.
 */

export function createMinimalMeadowPlayerDefeatState(
	playerState = {},
	maxHealth = 100
) {
	return {
		checkpoint: checkpointFrom(playerState),
		cycle: 0,
		defeatEmittedCycle: 0,
		defeatedAt: null,
		maxHealth: positive(maxHealth, 100),
		phase: 'active',
		reason: null,
		respawnedCycle: 0,
		retryCount: 0
	};
}

export function updateMinimalMeadowCheckpoint(defeatState, source) {
	defeatState.checkpoint = checkpointFrom(source);
	return { ...defeatState.checkpoint };
}

export function minimalMeadowPlayerDefeatSnapshot(state) {
	return Object.freeze({
		checkpoint: Object.freeze({ ...state.checkpoint }),
		cycle: state.cycle,
		defeatedAt: state.defeatedAt,
		maxHealth: state.maxHealth,
		phase: state.phase,
		reason: state.reason,
		respawnedCycle: state.respawnedCycle,
		retryCount: state.retryCount,
		status: state.phase
	});
}

function checkpointFrom(state = {}) {
	return {
		facing: finite(state.facing),
		x: finite(state.x),
		y: finite(state.renderY ?? state.y),
		z: finite(state.z)
	};
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
