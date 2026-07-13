// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorSystem.js
 * @description Orchestrates every moving soul and the visibility covenant that
 * conceals closed interiors within the one continuously made world of Awtsmoos.
 */
import { LavaLevel } from '../world/LavaLevel.js';
import { SunShadowProjector } from '../world/SunShadowProjector.js';
import { WorldModeManager } from '../world/WorldModeManager.js';
import { createHouseVisibilitySystem } from '../world/visibility/HouseVisibilitySystem.js';
import {
	createEretzDoors,
	createEretzJumpPhysics,
	createEretzMover,
	createEretzNpc,
	createEretzPlayerState,
	createEretzPlayerStats
} from './EretzActorFactories.js';
import { createPlayerModel } from './EretzPlayerModel.js';

/** Installs player, doors, NPC, lava, collision, shadows, and house culling. */
export function createEretzActors(foundation) {
	const playerModel = createPlayerModel(foundation.playerGltf, foundation.scene);
	const initialY = foundation.groundSampler.heightAt(0, 4).y + playerModel.footOffset;
	const playerStats = createEretzPlayerStats();
	const state = createEretzPlayerState(initialY, playerModel.feet, playerStats);
	const doors = createEretzDoors(foundation, state);
	const npc = createEretzNpc(foundation);
	const lava = new LavaLevel(foundation.scene, foundation.assets);
	const shadows = new SunShadowProjector(foundation.scene);
	const mover = createEretzMover(foundation, playerModel);
	const jumpPhysics = createEretzJumpPhysics(foundation, playerModel);
	const houses = foundation.terrain.worldMetadata.houses || [];
	const worldMode = createWorldMode({
		foundation,
		state,
		mover,
		lava,
		npc,
		doors,
		footOffset: playerModel.footOffset
	});
	const houseVisibility = createHouseVisibilitySystem({
		root: foundation.terrain.group,
		houses,
		doors
	}, state);
	foundation.orbit.setSpatialContext({
		state,
		houses,
		stairs: foundation.terrain.worldMetadata.stairLayouts || []
	});
	return {
		...foundation,
		...playerModel,
		playerStats,
		state,
		doors,
		npc,
		lava,
		shadows,
		mover,
		jumpPhysics,
		worldMode,
		houseVisibility
	};
}

function createWorldMode({ foundation, state, mover, lava, npc, doors, footOffset }) {
	return new WorldModeManager({
		state,
		ground: foundation.ground,
		mover,
		mainOctree: foundation.mainOctree,
		mainGroup: foundation.terrain.group,
		lava,
		mainObjects: [npc.group, ...doors.map((door) => door.mesh)],
		footOffset
	}).rememberMainHeight(foundation.terrain.heightAt);
}
