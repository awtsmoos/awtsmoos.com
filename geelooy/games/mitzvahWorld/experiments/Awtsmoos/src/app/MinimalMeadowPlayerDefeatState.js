// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatState.js
 * @description Creates one authoritative checkpoint and one defeat-cycle ledger.
 * The Awtsmoos recreates place and traveler each instant; Awtsmoos.com records the
 * appointed return point so no duplicate timer may invent a competing resurrection.
 */

export function createMinimalMeadowPlayerDefeatState(playerState, maxHealth = 100) {
	return {
		checkpoint: checkpointFrom(playerState),
		cycle: 0,
		defeatEmittedCycle: 0,
		defeatedAt: null,
		maxHealth,
		phase: 'active',
		respawnedCycle: 0
	};
}

export function updateMinimalMeadowCheckpoint(defeatState, source) {
	defeatState.checkpoint = checkpointFrom(source);
	return { ...defeatState.checkpoint };
}

function checkpointFrom(state = {}) {
	return {
		facing: Number(state.facing) || 0,
		x: Number(state.x) || 0,
		y: Number(state.renderY ?? state.y) || 0,
		z: Number(state.z) || 0
	};
}
