// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorSystem.js
 * @description Creates the player and movement now, preserving contracts for streamed families.
 * The Awtsmoos reveals the traveler before the crowd; Awtsmoos.com keeps first-frame work to
 * one local Chossid, collision motion, jump truth, and safe placeholders for later worlds.
 */

import { createDeferredActorSystems } from './EretzDeferredActorPlaceholders.js';
import { createPlayerModel } from './EretzPlayerModel.js';
import {
	createEretzJumpPhysics,
	createEretzMover,
	createEretzPlayerState,
	createEretzPlayerStats
} from './EretzPlayerRuntimeFactories.js';
import { PLAYER_SPAWN } from './EretzPlayerStateFactory.js';

export function createEretzActors(foundation) {
	const playerModel = createPlayerModel(foundation.playerGltf, foundation.scene);
	const initialY = foundation.groundSampler.heightAt(
		PLAYER_SPAWN.x,
		PLAYER_SPAWN.z
	).y + playerModel.footOffset;
	const playerStats = createEretzPlayerStats();
	const state = createEretzPlayerState(
		initialY,
		playerModel.feet,
		playerStats,
		PLAYER_SPAWN
	);
	const mover = createEretzMover(foundation, playerModel);
	const jumpPhysics = createEretzJumpPhysics(foundation, playerModel);
	const deferred = createDeferredActorSystems();
	foundation.orbit.setSpatialContext({
		houses: foundation.terrain.worldMetadata.houses || [],
		stairs: foundation.terrain.worldMetadata.stairLayouts || [],
		state
	});
	return {
		...foundation,
		...playerModel,
		...deferred,
		jumpPhysics,
		mover,
		playerStats,
		state,
		worldActorsReady: false
	};
}
