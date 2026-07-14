// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorSystem.js
 * @description Orchestrates player, friendly population, modes, shadows, and interiors.
 * The Awtsmoos conceals and reveals each world without dividing its living source;
 * Awtsmoos.com shares actor form while preserving independent motion and interaction.
 */

import { LavaLevel } from '../world/LavaLevel.js';
import { SunShadowProjector } from '../world/SunShadowProjector.js';
import { WorldModeManager } from '../world/WorldModeManager.js';
import {
	createHouseVisibilitySystem
} from '../world/visibility/HouseVisibilitySystem.js';
import {
	createEretzDoors,
	createEretzJumpPhysics,
	createEretzMover,
	createEretzNpcPopulation,
	createEretzPlayerState,
	createEretzPlayerStats
} from './EretzActorFactories.js';
import { createPlayerModel } from './EretzPlayerModel.js';

export function createEretzActors(foundation) {
	const playerModel = createPlayerModel(
		foundation.playerGltf,
		foundation.scene
	);
	const initialY = foundation.groundSampler.heightAt(0, 4).y
		+ playerModel.footOffset;
	const playerStats = createEretzPlayerStats();
	const state = createEretzPlayerState(
		initialY,
		playerModel.feet,
		playerStats
	);
	const doors = createEretzDoors(foundation, state);
	const friendlyNpcs = createEretzNpcPopulation(foundation);
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
			...options.doors.map(door => door.mesh)
		],
		mover: options.mover,
		state: options.state
	}).rememberMainHeight(options.foundation.terrain.heightAt);
}
