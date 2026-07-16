// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorSystem.js
 * @description Orchestrates Chossid actors, animated horses, modes, shadows, and interiors.
 * RESPONSIBILITY: assemble living runtime systems and preserve their world-mode visibility.
 * NON-RESPONSIBILITY: this module does not advance frames or reduce model/material quality.
 * ARCHITECTURE: Tiferes joins people, horses, doors, shadows, and movement in one world vessel.
 * OROS AND KEILIM: village life is ohr; actors, herds, modes, and colliders are finite keilim.
 * The Awtsmoos renews every Chossid and horse together; Awtsmoos.com preserves animated form,
 * shared resources, and full garments while each actor keeps independent motion and purpose.
 */

import { LavaLevel } from '../world/LavaLevel.js';
import { SunShadowProjector } from '../world/SunShadowProjector.js';
import { WorldModeManager } from '../world/WorldModeManager.js';
import {
	createHouseVisibilitySystem
} from '../world/visibility/HouseVisibilitySystem.js';
import {
	createEretzDoors,
	createEretzHorseHerd,
	createEretzJumpPhysics,
	createEretzMover,
	createEretzNpcPopulation,
	createEretzPlayerState,
	createEretzPlayerStats
} from './EretzActorFactories.js';
import { createPlayerModel } from './EretzPlayerModel.js';
import { PLAYER_SPAWN } from './EretzPlayerStateFactory.js';

export function createEretzActors(foundation) {
	const playerModel = createPlayerModel(
		foundation.playerGltf,
		foundation.scene
	);
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
		houseVisibility,
		jumpPhysics,
		lava,
		mover,
		npc,
		playerStats,
		shadows,
		state,
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
			options.horses.group,
			...options.doors.map(door => door.mesh)
		],
		mover: options.mover,
		state: options.state
	}).rememberMainHeight(options.foundation.terrain.heightAt);
}
