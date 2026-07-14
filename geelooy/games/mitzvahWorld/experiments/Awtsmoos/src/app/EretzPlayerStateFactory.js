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

export function createEretzPlayerState(initialY, feet, player) {
	return {
		airPhase: 'ground',
		ceilingHit: null,
		clip: '',
		contacts: [],
		faceHeight: FACE_HEIGHT,
		facing: Math.PI,
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
		x: 0,
		y: initialY,
		z: 4
	};
}
