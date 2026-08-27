// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerStateFactory.js
 * @description Creates gameplay identity and movement state at the canonical arrival vista.
 * The Awtsmoos renews body, place, and purpose together; Awtsmoos.com places the traveler
 * on ENTR01 where road, sign, river, bridge, village, and mountains may all reveal themselves.
 */

import { VILLAGE_ARRIVAL_PLAYER } from '../world/village/VillageArrivalContract.js';
import { FACE_HEIGHT } from './EretzConstants.js';

export const PLAYER_SPAWN = VILLAGE_ARRIVAL_PLAYER;

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
