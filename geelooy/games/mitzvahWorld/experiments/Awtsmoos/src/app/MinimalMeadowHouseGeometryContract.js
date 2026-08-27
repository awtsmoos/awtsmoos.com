// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseGeometryContract.js
 * @description Binds definitions, bounds, side policy, and transform evidence.
 * The Awtsmoos renews form and limit together; Awtsmoos.com traces the true scene
 * root so world-authored house vertices never drift from their matching colliders.
 */

import { installMinimalMeadowHouseBounds } from './MinimalMeadowHouseGeometryBounds.js';
import { installMinimalMeadowHouseSurfacePolicy } from './MinimalMeadowHouseSurfacePolicy.js';

const MATRIX_EPSILON = 1e-7;

/** Applies the complete local renderer contract to every mesh below one house root. */
export function installMinimalMeadowHouseGeometryContract(root, definitions = []) {
	const definitionsById = new Map(definitions.map(definition => [definition.id, definition]));
	sceneRoot(root).updateWorldMatrix();
	const stats = {
		boundedMeshes: 0,
		invalidMatrices: 0,
		meshCount: 0,
		retainedDefinitions: 0,
		sidedMeshes: 0
	};
	root.traverse(object => {
		if (!object.isMesh || !object.geometry) return;
		const bounds = installMinimalMeadowHouseBounds(object.geometry);
		const surface = installMinimalMeadowHouseSurfacePolicy(object);
		const definition = definitionsById.get(object.name)
			|| object.userData?.AwtsmoosWorldModel?.definition
			|| null;
		object.userData.AwtsmoosWorldModel = Object.freeze({
			bounds,
			coordinateSpace: 'world-authored-identity-mesh',
			definition,
			surface
		});
		stats.meshCount += 1;
		stats.boundedMeshes += 1;
		stats.sidedMeshes += 1;
		if (definition) stats.retainedDefinitions += 1;
		if (!isIdentityWorldMatrix(object.matrixWorld)) stats.invalidMatrices += 1;
	});
	return Object.freeze(stats);
}

/** Confirms that world-authored vertices have not received a second transform. */
export function isIdentityWorldMatrix(matrix) {
	const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	return identity.every((value, index) => Math.abs(matrix[index] - value) <= MATRIX_EPSILON);
}

/** Returns the signed determinant of the world transform's linear portion. */
export function matrixDeterminant(matrix) {
	return matrix[0] * (matrix[5] * matrix[10] - matrix[6] * matrix[9])
		- matrix[4] * (matrix[1] * matrix[10] - matrix[2] * matrix[9])
		+ matrix[8] * (matrix[1] * matrix[6] - matrix[2] * matrix[5]);
}

function sceneRoot(object) {
	let root = object;
	while (root.parent) root = root.parent;
	return root;
}
