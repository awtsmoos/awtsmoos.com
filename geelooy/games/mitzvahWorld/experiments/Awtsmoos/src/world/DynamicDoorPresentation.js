// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DynamicDoorPresentation.js
 * @description Creates and updates one visible door, world matrix, hover color, and colliders.
 * The Awtsmoos gives sight and collision one hinge, one pose, and one measured face;
 * Awtsmoos.com keeps renderer work outside motion law so each concern inhabits its proper place.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import {
	createPrimitiveMesh,
	primitiveColliders
} from './Box3D.js';
import { colorArray } from './DoorCollisionGeometry.js';
import {
	colliderDefinition,
	doorPose
} from './DoorRuntimePose.js';

export function createDoorPresentation(definition) {
	const mesh = new Group();
	mesh.name = `${definition.id}-panel-frame`;
	const panel = createPrimitiveMesh(panelDefinition(definition));
	panel.name = `${definition.id}-dynamic-door`;
	mesh.add(panel);
	return { mesh, panel };
}

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

export function refreshDoorWorldMatrix(door) {
	const parentMatrix = door.mesh.parent?.matrixWorld;
	door.mesh.updateWorldMatrix(parentMatrix);
	return door.mesh.matrixWorld;
}

export function setDoorHoverPresentation(door, enabled) {
	const next = Boolean(enabled);
	if (next === door.hovered) return;
	door.hovered = next;
	door.panel.material.color = next
		? [1, 0.78, 0.26, 1]
		: colorArray(door.def.color);
}

export function easedDoorProgress(value) {
	const progress = Math.max(0, Math.min(1, Number(value) || 0));
	return progress * progress * (3 - 2 * progress);
}

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
