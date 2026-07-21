// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorFactories.js
 * @description Creates player, people, shadows, targeting, horses, doors, movement, and jump.
 * RESPONSIBILITY: construct focused actor systems from one accepted world foundation.
 * NON-RESPONSIBILITY: this module does not run the frame loop or reduce visual quality.
 * The Awtsmoos renews each living form within a measured vessel; Awtsmoos.com shares immutable
 * resources while friendly purpose, hostile challenge, and one targeting stream remain explicit.
 */

import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { JumpPhysics } from '../motion/JumpPhysics.js';
import { DynamicDoor3D } from '../world/DynamicDoor3D.js';
import { tallDoorDef } from '../world/DoorwaySpecs.js';
import { HostileNpcPopulation } from '../world/enemy/HostileNpcPopulation.js?v=20260721-spatial-targeting-01';
import { HorseHerdSystem } from '../world/horses/HorseHerdSystem.js';
import { allHouseDoorDefs } from '../world/House3D.js';
import { FriendlyNpcPopulation } from '../world/npc/FriendlyNpcPopulation.js';
import { WorldTargetCoordinator } from '../world/targeting/WorldTargetCoordinator.js';
import {
	MAX_SLOPE_NORMAL,
	PLAYER_HEIGHT,
	PLAYER_RADIUS
} from './EretzConstants.js';

export {
	createEretzPlayerState,
	createEretzPlayerStats
} from './EretzPlayerStateFactory.js?v=20260720-canonical-valley-pass-04';

export function createEretzDoors(foundation, state) {
	const definitions = [
		tallDoorDef(),
		...allHouseDoorDefs(foundation.assets, foundation.phaseOneGround)
	];
	return definitions.map(definition => {
		const door = new DynamicDoor3D(definition);
		door.setInteractionContext({
			canvas: foundation.canvas,
			getCameraTarget: () => ({
				x: state.x,
				y: state.renderY + state.faceHeight,
				z: state.z
			})
		}).install(foundation.canvas, foundation.camera);
		foundation.scene.add(door.mesh);
		return door;
	});
}

export function createEretzNpcPopulation(foundation) {
	const population = new FriendlyNpcPopulation({
		bus: foundation.bus,
		camera: foundation.camera,
		canvas: foundation.canvas,
		gltfs: foundation.npcGltfs,
		ground: foundation.ground,
		ownsPointer: false,
		profiles: foundation.npcProfiles
	});
	foundation.scene.add(population.group);
	return population;
}

export function createEretzHostilePopulation(foundation) {
	const population = new HostileNpcPopulation({
		bus: foundation.bus,
		camera: foundation.camera,
		canvas: foundation.canvas,
		ground: foundation.ground,
		ownsPointer: false,
		quality: foundation.qualityProfile?.quality || 'high'
	});
	foundation.scene.add(population.group);
	return population;
}

export function createEretzTargetCoordinator(foundation, friendlyNpcs, hostileNpcs) {
	return new WorldTargetCoordinator({
		canvas: foundation.canvas,
		populations: [friendlyNpcs, hostileNpcs]
	});
}

export function createEretzHorseHerd(foundation) {
	return new HorseHerdSystem(foundation.scene, foundation.ground);
}

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
