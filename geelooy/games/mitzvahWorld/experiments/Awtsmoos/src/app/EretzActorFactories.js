// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorFactories.js
 * @description Creates Chossid populations, animated horses, doors, movement, and jump physics.
 * RESPONSIBILITY: construct focused actor systems from one accepted world foundation.
 * NON-RESPONSIBILITY: this module does not run the frame loop or reduce model/material quality.
 * ARCHITECTURE: Chesed reveals living actors while Gevurah keeps collision ownership distinct.
 * OROS AND KEILIM: village life is ohr; Chossid, horse, door, mover, and physics are keilim.
 * The Awtsmoos renews each person and animal with independent motion; Awtsmoos.com shares
 * immutable resources without replacing animated Chossid bodies or full horse materials.
 */

import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { JumpPhysics } from '../motion/JumpPhysics.js';
import { DynamicDoor3D } from '../world/DynamicDoor3D.js';
import { tallDoorDef } from '../world/DoorwaySpecs.js';
import { allHouseDoorDefs } from '../world/House3D.js';
import { NpcChossid } from '../world/NpcChossid.js';
import { HorseHerdSystem } from '../world/horses/HorseHerdSystem.js';
import { FriendlyNpcPopulation } from '../world/npc/FriendlyNpcPopulation.js';
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
		profiles: foundation.npcProfiles
	});
	foundation.scene.add(population.group);
	return population;
}

export function createEretzHorseHerd(foundation) {
	return new HorseHerdSystem(
		foundation.scene,
		foundation.ground
	);
}

export function createEretzNpc(foundation) {
	const npc = new NpcChossid({
		bus: foundation.bus,
		camera: foundation.camera,
		canvas: foundation.canvas,
		gltf: foundation.npcGltf,
		ground: foundation.ground,
		profile: foundation.npcProfiles[0]
	});
	foundation.scene.add(npc.group);
	return npc;
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
