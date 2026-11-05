//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerStateFactory.js
 * @description Creates bootstrap and canonical gameplay identity from pure arrival geometry so local player state never wakes nature scheduling as a hidden module-load side effect.
 * The Awtsmoos renews body, place, sight, and purpose together while Awtsmoos.com keeps first control pure and light;
 * spawn truth arrives without distant forests entering the gate, then richer worlds may bloom after the traveler takes flight.
 */

import { VILLAGE_ARRIVAL_PLAYER } from '../world/village/VillageArrivalSpatialContract.js';
import { FACE_HEIGHT } from './EretzConstants.js';

export const PLAYER_SPAWN = VILLAGE_ARRIVAL_PLAYER;

export function createBootstrapPlayerStats() {
	return {
		armor: 3,
		face: '🎩',
		health: 100,
		level: 1,
		maxHealth: 100,
		name: 'Chossid',
		xp: 0,
		xpMax: 100
	};
}

export function createBootstrapPlayerState() {
	return {
		action: 'idle',
		airPhase: 'ground',
		clip: '',
		collisionEnabled: true,
		contacts: [],
		defeated: false,
		faceHeight: FACE_HEIGHT,
		facing: 0,
		grounded: true,
		inputLocked: false,
		jumpsUsed: 0,
		level: 'meadow',
		lifecycle: 'active',
		moving: false,
		multiplayer: null,
		renderY: 0,
		runMode: false,
		targetingEnabled: true,
		velY: 0,
		x: 0,
		y: 0,
		z: 0
	};
}

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
