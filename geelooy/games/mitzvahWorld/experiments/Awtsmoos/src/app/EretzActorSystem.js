// B"H
import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { JumpPhysics } from '../motion/JumpPhysics.js';
import { DynamicDoor3D } from '../world/DynamicDoor3D.js';
import { allHouseDoorDefs } from '../world/House3D.js';
import { LavaLevel } from '../world/LavaLevel.js';
import { NpcChossid } from '../world/NpcChossid.js';
import { SunShadowProjector } from '../world/SunShadowProjector.js';
import { tallDoorDef } from '../world/DoorwaySpecs.js';
import { WorldModeManager } from '../world/WorldModeManager.js';
import {
	FACE_HEIGHT,
	MAX_SLOPE_NORMAL,
	PLAYER_HEIGHT,
	PLAYER_RADIUS
} from './EretzConstants.js';
import { createPlayerModel } from './EretzPlayerModel.js';

/** Installs player, doors, NPC, lava, collision, and shadows into the world. */
export function createEretzActors(foundation) {
	const playerModel = createPlayerModel(foundation.playerGltf, foundation.scene);
	const initialY = foundation.groundSampler.heightAt(0, 4).y + playerModel.footOffset;
	const playerStats = {
		face: '🎩',
		name: 'Chossid',
		health: 100,
		xp: 0,
		xpMax: 100,
		level: 1
	};
	const state = createPlayerState(initialY, playerModel.feet, playerStats);
	const doorDefinitions = [
		tallDoorDef(),
		...allHouseDoorDefs(foundation.assets, foundation.phaseOneGround)
	];
	const doors = doorDefinitions.map((definition) => new DynamicDoor3D(definition));
	for (const door of doors) {
		door.setInteractionContext({
			canvas: foundation.canvas,
			getCameraTarget: () => ({ x: state.x, y: state.renderY + state.faceHeight, z: state.z })
		}).install(foundation.canvas, foundation.camera);
		foundation.scene.add(door.mesh);
	}
	const npc = new NpcChossid({
		gltf: foundation.npcGltf,
		canvas: foundation.canvas,
		camera: foundation.camera,
		bus: foundation.bus,
		ground: foundation.ground
	});
	foundation.scene.add(npc.group);
	const lava = new LavaLevel(foundation.scene, foundation.assets);
	const shadows = new SunShadowProjector(foundation.scene);
	const mover = new AwtsmoosCollisionMover({
		octree: foundation.mainOctree,
		radius: PLAYER_RADIUS,
		height: PLAYER_HEIGHT,
		footOffset: playerModel.footOffset
	});
	const jumpPhysics = new JumpPhysics({
		ground: foundation.ground,
		footOffset: playerModel.footOffset,
		maxSlopeNormal: MAX_SLOPE_NORMAL
	});
	const worldMode = new WorldModeManager({
		state,
		ground: foundation.ground,
		mover,
		mainOctree: foundation.mainOctree,
		mainGroup: foundation.terrain.group,
		lava,
		mainObjects: [npc.group, ...doors.map((door) => door.mesh)],
		footOffset: playerModel.footOffset
	}).rememberMainHeight(foundation.terrain.heightAt);
	foundation.orbit.setSpatialContext({
		state,
		houses: foundation.terrain.worldMetadata.houses || [],
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
		worldMode
	};
}

function createPlayerState(initialY, feet, playerStats) {
	return {
		x: 0, y: initialY, renderY: initialY, z: 4,
		facing: Math.PI, moving: false, runMode: false,
		clip: '', feet, contacts: [], normals: [], velY: 0,
		grounded: true, airPhase: 'ground', jumpClock: 0,
		faceHeight: FACE_HEIGHT, stepState: 'flat', slopeState: 'walk',
		ceilingHit: null, level: 'eretz', player: playerStats
	};
}
