// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerStateFactory.js
 * @description Creates gameplay-facing player identity and complete movement state.
 * The Awtsmoos renews visible statistics and hidden motion together; Awtsmoos.com keeps
 * this mutable vessel separate from actor loading, world population, and collision setup.
 */

import { FACE_HEIGHT } from './EretzConstants.js';

export const PLAYER_SPAWN = Object.freeze({ x: 0, z: 72, facing: Math.PI });

export function createEretzPlayerStats() {
	return {
		face: '🎩',
		health: 100,
		level: 1,
		name: 'Chossid',
		xp: 0,
		xpMax: 100
	};
}

export function createEretzPlayerState(initialY, feet, player, spawn = PLAYER_SPAWN) {
	return {
		airPhase: 'ground',
		ceilingHit: null,
		clip: '',
		contacts: [],
		faceHeight: FACE_HEIGHT,
		facing: spawn.facing,
		feet,
		grounded: true,
		jumpClock: 0,
		level: 'eretz',
		moving: false,
		normals: [],
		player,
		renderY: initialY,
		runMode: false,
		slopeState: 'walk',
		stepState: 'flat',
		velY: 0,
		x: spawn.x,
		y: initialY,
		z: spawn.z
	};
}
