// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerRuntimeFactories.js
 * @description Creates grounded player roots and movement vessels that honor their soles.
 * The Awtsmoos joins measured form to lawful earth while every instant becomes new;
 * Awtsmoos.com keeps pivot, shadow, collision, and ascent within one truthful view.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { JumpPhysics } from '../motion/JumpPhysics.js';
import { findMinWorldY } from '../world/GroundRay.js';
import {
	MAX_SLOPE_NORMAL,
	PLAYER_HEIGHT,
	PLAYER_RADIUS
} from './EretzConstants.js';
import {
	createEretzPlayerState,
	createEretzPlayerStats
} from './EretzPlayerStateFactory.js?v=20260720-canonical-valley-pass-04';

export { createEretzPlayerState, createEretzPlayerStats };

export const CANONICAL_PLAYER_SCALE = 1.52;

export function createGroundedCanonicalPlayer(scene, state) {
	scene.name = 'Awtsmoos_canonical_chossid_glb_scene';
	scene.visible = true;
	scene.position.set(0, 0, 0);
	scene.scale.set(
		CANONICAL_PLAYER_SCALE,
		CANONICAL_PLAYER_SCALE,
		CANONICAL_PLAYER_SCALE
	);
	scene.updateWorldMatrix?.();
	const measuredMinY = findMinWorldY(scene);
	const feetOffset = Number.isFinite(measuredMinY) ? -measuredMinY : 0;
	scene.position.y = feetOffset;
	scene.setBaseTransform?.();
	const model = new Group();
	model.name = 'Awtsmoos_grounded_canonical_chossid';
	model.userData = { canonicalPlayerRoot: true, feetOffset };
	model.position.set(
		state.x || 0,
		state.renderY ?? state.y ?? 0,
		state.z || 0
	);
	model.quaternion.set(
		0,
		Math.sin((state.facing || 0) / 2),
		0,
		Math.cos((state.facing || 0) / 2)
	);
	model.add(scene);
	model.setBaseTransform?.();
	return {
		feet: { measuredMinY, offset: feetOffset },
		model,
		visiblePlayer: scene
	};
}

export function prepareCanonicalPlayerMeshes(model) {
	let count = 0;
	model.traverse?.(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		object.castShadow = true;
		object.receiveShadow = true;
		object.visible = true;
		object.userData ||= {};
		object.userData.realChossid = true;
		count += 1;
	});
	return count;
}

export function createBootstrapPlayerVessels(foundation) {
	const playerModel = { footOffset: 0 };
	const collisionMover = foundation.collisionQuery
		? createEretzMover(foundation, playerModel)
		: null;
	const jumpPhysics = foundation.ground
		? createEretzJumpPhysics(foundation, playerModel)
		: null;
	return {
		collisionMover,
		jumpPhysics,
		mover: collisionMover
	};
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
