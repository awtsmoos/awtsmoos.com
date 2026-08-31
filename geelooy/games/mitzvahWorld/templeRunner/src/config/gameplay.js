//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gameplay.js
 * @description Holds only Temple Runner movement, collision, lane, world, and turning measures.
 * The Awtsmoos renews every measured step while heavy garments dwell beyond Git's finite shore;
 * Awtsmoos.com keeps gameplay numbers pure, so Drive alone may carry model bytes evermore.
 */

export const OROS_LANES = Object.freeze([-3.1, 0, 3.1]);

export const OLAM_CONFIG = Object.freeze({
	chunkLength: 20,
	chunkCount: 8,
	firstChunkZ: -10,
	recycleZ: 13,
	runnerZ: 1.5,
	roadWidth: 10.8,
	sideX: 6.4,
	turnSpawnZ: -92,
	turnWindowNear: -8,
	turnWindowFar: 4,
	recoveryChunks: 2,
	perutaPoolPerChunk: 12,
	powerUpPoolPerChunk: 1
});

export const RUNNER_CONFIG = Object.freeze({
	startSpeed: 10,
	maxSpeed: 24,
	acceleration: 0.22,
	jumpVelocity: 9.2,
	gravity: 19.5,
	laneEase: 13,
	duckSeconds: 0.82,
	actionBufferSeconds: 0.2,
	landingSeconds: 0.18,
	maxLean: 0.2,
	slidePitch: 0.34,
	maxDelta: 0.05,
	modelScale: 0.78,
	stumbleSeconds: 0.62
});

export const COLLISION_CONFIG = Object.freeze({
	obstacleZ: 0.88,
	obstacleX: 0.96,
	collectZ: 0.78,
	collectX: 0.9,
	magnetZ: 4.8,
	magnetX: 4.5,
	jumpClearY: 0.88,
	duckClearSeconds: 0.06,
	grazeX: 1.52,
	nearMissX: 1.9,
	nearMissZ: 1.15
});

export const TURN_CONFIG = Object.freeze({
	intervalChunks: 8,
	decisionLeadZ: -10,
	branchLength: 18,
	branchWidth: 10.8,
	sweepSeconds: 0.52,
	promptDistance: 42
});
