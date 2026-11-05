//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowHouseGeometryContract.js
 * @description Validates bounds, surfaces, semantic definitions, and coordinate-space transform laws.
 * Static house meshes are authored directly in world space and therefore must retain an identity
 * world matrix. Dynamic doorway panels are intentionally authored in local space beneath a moving
 * hinge frame, so they instead prove finite, non-singular transforms without losing animation.
 */

import { installMinimalMeadowHouseBounds } from './MinimalMeadowHouseGeometryBounds.js';
import { installMinimalMeadowHouseSurfacePolicy } from './MinimalMeadowHouseSurfacePolicy.js';

const MATRIX_EPSILON = 1e-7;
const WORLD_AUTHORED_SPACE = 'world-authored-identity-mesh';

/**
 * Applies the complete geometry contract to every renderable house mesh.
 * @param {object} root House population root whose descendants are validated in place.
 * @param {object[]} definitions Renderer-neutral world definitions keyed by stable identity.
 * @returns {Readonly<object>} Frozen diagnostic counters for production and regression evidence.
 */
export function installMinimalMeadowHouseGeometryContract(root, definitions = []) {
	const definitionsById = new Map(definitions.map(definition => [definition.id, definition]));
	sceneRoot(root).updateWorldMatrix();
	const stats = createStats();
	root.traverse(object => {
		if (!object.isMesh || !object.geometry) {
			return;
		}
		const bounds = installMinimalMeadowHouseBounds(object.geometry);
		const surface = installMinimalMeadowHouseSurfacePolicy(object);
		const coordinateSpace = declaredCoordinateSpace(object);
		const definition = definitionsById.get(object.name)
			|| object.userData?.AwtsmoosWorldModel?.definition
			|| null;
		object.userData ||= {};
		object.userData.AwtsmoosWorldModel = Object.freeze({
			bounds,
			coordinateSpace,
			definition,
			surface
		});
		stats.meshCount += 1;
		stats.boundedMeshes += 1;
		stats.sidedMeshes += 1;
		if (definition) {
			stats.retainedDefinitions += 1;
		}
		if (!matrixMatchesCoordinateSpace(object.matrixWorld, coordinateSpace)) {
			stats.invalidMatrices += 1;
		}
	});
	return Object.freeze(stats);
}

/** Confirms that world-authored vertices have not received a second transform. */
export function isIdentityWorldMatrix(matrix) {
	const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	return identity.every((value, index) => {
		return Math.abs(matrix[index] - value) <= MATRIX_EPSILON;
	});
}

/** Returns the signed determinant of the world transform's linear portion. */
export function matrixDeterminant(matrix) {
	return matrix[0] * (matrix[5] * matrix[10] - matrix[6] * matrix[9])
		- matrix[4] * (matrix[1] * matrix[10] - matrix[2] * matrix[9])
		+ matrix[8] * (matrix[1] * matrix[6] - matrix[2] * matrix[5]);
}

/**
 * Accepts dynamic local-authored transforms only when every component is finite and invertible.
 * @param {ArrayLike<number>} matrix Native world matrix produced by the scene hierarchy.
 * @returns {boolean} True when the matrix is numerically safe for animation and collision mapping.
 */
export function isFiniteNonSingularWorldMatrix(matrix) {
	for (let index = 0; index < 16; index += 1) {
		if (!Number.isFinite(matrix[index])) {
			return false;
		}
	}
	return Math.abs(matrixDeterminant(matrix)) > MATRIX_EPSILON;
}

function matrixMatchesCoordinateSpace(matrix, coordinateSpace) {
	return coordinateSpace === WORLD_AUTHORED_SPACE
		? isIdentityWorldMatrix(matrix)
		: isFiniteNonSingularWorldMatrix(matrix);
}
function declaredCoordinateSpace(object) {
	return object.userData?.coordinateSpace
		|| object.userData?.AwtsmoosWorldModel?.coordinateSpace
		|| WORLD_AUTHORED_SPACE;
}

function createStats() {
	return {
		boundedMeshes: 0,
		invalidMatrices: 0,
		meshCount: 0,
		retainedDefinitions: 0,
		sidedMeshes: 0
	};
}

function sceneRoot(object) {
	let root = object;
	while (root.parent) {
		root = root.parent;
	}
	return root;
}
