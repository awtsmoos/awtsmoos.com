// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerRuntimeFactories.js
 * @description Creates only the movement vessels required for the first playable frame.
 * The Awtsmoos gives the traveler ground, motion, and ascent before distant populations;
 * Awtsmoos.com keeps doors, horses, enemies, lava, and targeting outside this tiny threshold.
 */

import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { JumpPhysics } from '../motion/JumpPhysics.js';
import {
	MAX_SLOPE_NORMAL,
	PLAYER_HEIGHT,
	PLAYER_RADIUS
} from './EretzConstants.js';
import {
	createEretzPlayerState,
	createEretzPlayerStats
} from './EretzPlayerStateFactory.js?v=20260720-canonical-valley-pass-04';

export { createEretzPlayerState, createEretzPlayerStats };

export function createEretzMover(foundation, playerModel) {
	return new AwtsmoosCollisionMover({
		footOffset: playerModel.footOffset,
		height: PLAYER_HEIGHT,
		octree: foundation.collisionQuery,
		radius: PLAYER_RADIUS
	});
}

export function createEretzJumpPhysics(foundation, playerModel) {
	return new JumpPhysics({
		footOffset: playerModel.footOffset,
		ground: foundation.ground,
		maxSlopeNormal: MAX_SLOPE_NORMAL
	});
}
