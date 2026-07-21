// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorSystem.js
 * @description Orchestrates people, shadows, shared targeting, horses, modes, and interiors.
 * RESPONSIBILITY: assemble living runtime systems and preserve world-mode visibility.
 * NON-RESPONSIBILITY: this module does not advance frames or reduce model quality.
 * The Awtsmoos renews every actor together; Awtsmoos.com preserves independent purpose,
 * bounded challenge, one target stream, collision truth, and the player's immediate movement.
 */

import { LavaLevel } from '../world/LavaLevel.js';
import { SunShadowProjector } from '../world/SunShadowProjector.js';
import { WorldModeManager } from '../world/WorldModeManager.js';
import { createHouseVisibilitySystem } from '../world/visibility/HouseVisibilitySystem.js';
import {
	createEretzDoors,
	createEretzHorseHerd,
	createEretzHostilePopulation,
	createEretzJumpPhysics,
	createEretzMover,
	createEretzNpcPopulation,
	createEretzPlayerState,
	createEretzPlayerStats,
	createEretzTargetCoordinator
} from './EretzActorFactories.js?v=20260721-shadow-runtime-02';
import { createPlayerModel } from './EretzPlayerModel.js';
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
	const doors = createEretzDoors(foundation, state);
	const friendlyNpcs = createEretzNpcPopulation(foundation);
	const hostileNpcs = createEretzHostilePopulation(foundation);
	const targetCoordinator = createEretzTargetCoordinator(
		foundation,
		friendlyNpcs,
		hostileNpcs
	);
	const horses = createEretzHorseHerd(foundation);
	const npc = friendlyNpcs.primary;
	const lava = new LavaLevel(foundation.scene, foundation.assets);
	const shadows = new SunShadowProjector(foundation.scene);
	const mover = createEretzMover(foundation, playerModel);
	const jumpPhysics = createEretzJumpPhysics(foundation, playerModel);
	const houses = foundation.terrain.worldMetadata.houses || [];
	const worldMode = createWorldMode({
		doors,
		footOffset: playerModel.footOffset,
		foundation,
		friendlyNpcs,
		horses,
		hostileNpcs,
		lava,
		mover,
		state
	});
	const houseVisibility = createHouseVisibilitySystem({
		doors,
		houses,
		root: foundation.terrain.group
	}, state);
	foundation.orbit.setSpatialContext({
		houses,
		stairs: foundation.terrain.worldMetadata.stairLayouts || [],
		state
	});
	return {
		...foundation,
		...playerModel,
		doors,
		friendlyNpcs,
		horses,
		hostileNpcs,
		houseVisibility,
		jumpPhysics,
		lava,
		mover,
		npc,
		playerStats,
		shadows,
		state,
		targetCoordinator,
		worldMode
	};
}

function createWorldMode(options) {
	return new WorldModeManager({
		eretzCollision: options.foundation.collisionQuery,
		footOffset: options.footOffset,
		ground: options.foundation.ground,
		lava: options.lava,
		mainGroup: options.foundation.terrain.group,
		mainObjects: [
			options.friendlyNpcs.group,
			options.hostileNpcs.group,
			options.horses.group,
			...options.doors.map(door => door.mesh)
		],
		mover: options.mover,
		state: options.state
	}).rememberMainHeight(options.foundation.terrain.heightAt);
}
