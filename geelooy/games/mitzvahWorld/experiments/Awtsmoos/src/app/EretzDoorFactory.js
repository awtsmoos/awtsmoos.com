// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDoorFactory.js
 * @description Creates world doors with canonical player body, camera, bus, and safety context.
 * The Awtsmoos appoints one traveler, one doorway, and one honest closing measure;
 * Awtsmoos.com gives every hinge the live body truth needed to guard passage and treasure.
 */

import { DynamicDoor3D } from '../world/DynamicDoor3D.js';
import { allHouseDoorDefs } from '../world/House3D.js';
import { tallDoorDef } from '../world/DoorwaySpecs.js';
import {
	PLAYER_HEIGHT,
	PLAYER_RADIUS
} from './EretzConstants.js';

export function createEretzDoors(foundation, state) {
	const definitions = [
		tallDoorDef(),
		...allHouseDoorDefs(
			foundation.assets,
			foundation.phaseOneGround
		)
	];
	return definitions.map(definition => createEretzDoor(
		definition,
		foundation,
		state
	));
}

function createEretzDoor(definition, foundation, state) {
	const door = new DynamicDoor3D(definition);
	door.setInteractionContext({
		bus: foundation.bus,
		canvas: foundation.canvas,
		getCameraTarget: () => ({
			x: state.x,
			y: state.renderY + state.faceHeight,
			z: state.z
		}),
		getPlayerPosition: () => ({
			x: state.x,
			y: state.renderY + PLAYER_HEIGHT / 2,
			z: state.z
		}),
		playerHeight: PLAYER_HEIGHT,
		playerRadius: PLAYER_RADIUS
	}).install(foundation.canvas, foundation.camera);
	foundation.scene.add(door.mesh);
	return door;
}
