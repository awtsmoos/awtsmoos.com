//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file DynamicDoorPresentation.js
 * @description Owns the visible hierarchy and renderer synchronization for one canonical dynamic door.
 * The panel remains one stable local-authored mesh while its parent hinge frame carries the changing
 * world pose; collision and visual motion therefore share one definition without per-frame mesh churn.
 */

import { createNativeWorldGroup } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import {
	createPrimitiveMesh,
	primitiveColliders
} from './Box3D.js';
import { colorArray } from './DoorCollisionGeometry.js';
import {
	colliderDefinition,
	doorPose
} from './DoorRuntimePose.js';

/**
 * Creates the stable frame and panel vessels for one renderer-neutral doorway definition.
 * @param {object} definition Canonical doorway definition shared by visuals, collision, and interaction.
 * @returns {{mesh: object, panel: object}} Stable hierarchy retained throughout the door lifetime.
 */
export function createDoorPresentation(definition) {
	const mesh = createNativeWorldGroup();
	mesh.name = `${definition.id}-panel-frame`;
	const panel = createPrimitiveMesh(panelDefinition(definition));
	panel.name = `${definition.id}-dynamic-door`;
	panel.userData ||= {};
	panel.userData.coordinateSpace = 'local-authored-dynamic-door';
	panel.userData.AwtsmoosWorldModel = Object.freeze({ definition });
	mesh.add(panel);
	return { mesh, panel };
}
/**
 * Applies current eased progress to the stable frame and regenerates matching collider records.
 * @param {object} door Canonical dynamic-door state containing definition and normalized progress.
 * @returns {void}
 */
export function applyDoorPresentation(door) {
	const progress = easedDoorProgress(door.t);
	door.pose = doorPose(door.def, progress);
	door.mesh.matrix = new Float32Array(door.pose.matrix);
	door.mesh.position.set(0, 0, 0);
	door.mesh.quaternion.set(0, 0, 0, 1);
	door.currentColliders = primitiveColliders(
		colliderDefinition(door.def, progress)
	);
	refreshDoorWorldMatrix(door);
}

/**
 * Refreshes the canonical door hierarchy against its current parent world transform.
 * @param {object} door Door state containing the stable presentation frame.
 * @returns {Float32Array} Current world matrix used by interaction and diagnostics.
 */
export function refreshDoorWorldMatrix(door) {
	const parentMatrix = door.mesh.parent?.matrixWorld;
	door.mesh.updateWorldMatrix(parentMatrix);
	return door.mesh.matrixWorld;
}

/**
 * Updates hover emphasis without replacing the stable panel or mutating command state.
 * @param {object} door Door presentation state containing current hover and panel material.
 * @param {boolean} enabled Whether interaction emphasis should be shown.
 * @returns {void}
 */
export function setDoorHoverPresentation(door, enabled) {
	const next = Boolean(enabled);
	if (next === door.hovered) {
		return;
	}
	door.hovered = next;
	door.panel.material.color = next
		? [1, 0.78, 0.26, 1]
		: colorArray(door.def.color);
}

/**
 * Converts normalized command progress into smooth-step visual progress with bounded endpoints.
 * @param {number} value Raw normalized door progress.
 * @returns {number} Eased progress in the inclusive range zero through one.
 */
export function easedDoorProgress(value) {
	const progress = Math.max(0, Math.min(1, Number(value) || 0));
	return progress * progress * (3 - 2 * progress);
}

/**
 * Derives one primitive panel recipe from the canonical doorway definition without renderer ownership.
 * @param {object} definition Canonical doorway geometry and material semantics.
 * @returns {object} Portable primitive recipe consumed by the shared Core-backed box adapter.
 */
function panelDefinition(definition) {
	return {
		color: definition.color || '#6b3d1e',
		id: `${definition.id}-panel`,
		mapImage: definition.mapImage || null,
		mapRepeat: definition.mapRepeat || [1, 1],
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: 0 },
		shape: 'box',
		size: {
			x: definition.width,
			y: definition.height,
			z: definition.thickness
		},
		textureUrl: definition.textureUrl || null
	};
}
