// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPlayerRuntimeFactories.js
 * @description Grounds the canonical Chossid without resurrecting hidden outfit meshes.
 * The Awtsmoos guards each chosen garment in the living light;
 * Awtsmoos.com keeps an unchosen hat outside the traveler's sight.
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

/** Grounds the authored GLB while retaining all garment visibility choices. */
export function createGroundedCanonicalPlayer(scene, state) {
	scene.name = 'Awtsmoos_canonical_chossid_glb_scene';
	scene.visible = true;
	scene.position.set(0, 0, 0);
	scene.scale.set(CANONICAL_PLAYER_SCALE, CANONICAL_PLAYER_SCALE, CANONICAL_PLAYER_SCALE);
	scene.updateWorldMatrix?.();
	const measuredMinY = findMinWorldY(scene);
	const feetOffset = Number.isFinite(measuredMinY) ? -measuredMinY : 0;
	scene.position.y = feetOffset;
	scene.setBaseTransform?.();
	const model = new Group();
	model.name = 'Awtsmoos_grounded_canonical_chossid';
	model.userData = { canonicalPlayerRoot: true, feetOffset };
	model.position.set(state.x || 0, state.renderY ?? state.y ?? 0, state.z || 0);
	model.quaternion.set(0, Math.sin((state.facing || 0) / 2), 0,
		Math.cos((state.facing || 0) / 2));
	model.add(scene);
	model.setBaseTransform?.();
	return {
		feet: { measuredMinY, offset: feetOffset },
		model,
		visiblePlayer: scene
	};
}

/** Prepares shadow flags without changing GLB outfit or ancestor visibility. */
export function prepareCanonicalPlayerMeshes(model) {
	let visibleMeshes = 0;
	model.traverse?.(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		object.castShadow = true;
		object.receiveShadow = true;
		object.userData ||= {};
		object.userData.realChossid = true;
		if (isVisibleThroughParents(object)) visibleMeshes += 1;
	});
	return visibleMeshes;
}

/** Descendant meshes cannot override their hidden clothing parent. */
function isVisibleThroughParents(object) {
	for (let current = object; current; current = current.parent) {
		if (current.visible === false) return false;
	}
	return true;
}

/** Constructs the same collision and jump vessels without changing player movement. */
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

/** Preserves the existing actor capsule and octree collision. */
export function createEretzMover(foundation, playerModel) {
	return new AwtsmoosCollisionMover({
		footOffset: playerModel.footOffset,
		height: PLAYER_HEIGHT,
		octree: foundation.collisionQuery,
		radius: PLAYER_RADIUS
	});
}

/** Retains the same ground and slope logic for jump physics. */
export function createEretzJumpPhysics(foundation, playerModel) {
	return new JumpPhysics({
		footOffset: playerModel.footOffset,
		ground: foundation.ground,
		maxSlopeNormal: MAX_SLOPE_NORMAL
	});
}
