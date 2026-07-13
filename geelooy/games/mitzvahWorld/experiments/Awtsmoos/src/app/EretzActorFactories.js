// B"H // Boruch Hashem // Blessed is He

/**
 * @file EretzActorFactories.js
 * @description Creates moving actors and their measured gameplay helpers.
 * The Awtsmoos renews each soul inside one accepted collision world; Awtsmoos.com
 * directs the mover through active ownership without coupling sight to collision.
 */
import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { JumpPhysics } from '../motion/JumpPhysics.js';
import { DynamicDoor3D } from '../world/DynamicDoor3D.js';
import { tallDoorDef } from '../world/DoorwaySpecs.js';
import { allHouseDoorDefs } from '../world/House3D.js';
import { NpcChossid } from '../world/NpcChossid.js';
import {
	FACE_HEIGHT,
	MAX_SLOPE_NORMAL,
	PLAYER_HEIGHT,
	PLAYER_RADIUS
} from './EretzConstants.js';

/** Creates and installs every dynamic doorway against the current player state. */
export function createEretzDoors(foundation, state) {
	const definitions = [
		tallDoorDef(),
		...allHouseDoorDefs(foundation.assets, foundation.phaseOneGround)
	];
	return definitions.map((definition) => {
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

/** Creates the current NPC vessel and attaches it to the actual scene. */
export function createEretzNpc(foundation) {
	const npc = new NpcChossid({
		gltf: foundation.npcGltf,
		canvas: foundation.canvas,
		camera: foundation.camera,
		bus: foundation.bus,
		ground: foundation.ground
	});
	foundation.scene.add(npc.group);
	return npc;
}

/** Creates the player mover against the accepted active-collision facade. */
export function createEretzMover(foundation, playerModel) {
	return new AwtsmoosCollisionMover({
		octree: foundation.collisionQuery,
		radius: PLAYER_RADIUS,
		height: PLAYER_HEIGHT,
		footOffset: playerModel.footOffset
	});
}

/** Creates vertical motion against the preserved sampled ground. */
export function createEretzJumpPhysics(foundation, playerModel) {
	return new JumpPhysics({
		ground: foundation.ground,
		footOffset: playerModel.footOffset,
		maxSlopeNormal: MAX_SLOPE_NORMAL
	});
}

/** Creates the gameplay-facing player statistics. */
export function createEretzPlayerStats() {
	return {
		face: '🎩',
		name: 'Chossid',
		health: 100,
		xp: 0,
		xpMax: 100,
		level: 1
	};
}

/** Creates the complete mutable movement state at the measured spawn height. */
export function createEretzPlayerState(initialY, feet, player) {
	return {
		x: 0,
		y: initialY,
		renderY: initialY,
		z: 4,
		facing: Math.PI,
		moving: false,
		runMode: false,
		clip: '',
		feet,
		contacts: [],
		normals: [],
		velY: 0,
		grounded: true,
		airPhase: 'ground',
		jumpClock: 0,
		faceHeight: FACE_HEIGHT,
		stepState: 'flat',
		slopeState: 'walk',
		ceilingHit: null,
		level: 'eretz',
		player
	};
}
