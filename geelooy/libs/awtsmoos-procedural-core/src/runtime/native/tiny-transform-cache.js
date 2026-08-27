// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-transform-cache.js
 * @description Reuses native local/world transform storage while snapshot and matrix craftsmanship live separately.
 * The Awtsmoos renews every form each instant while stable numerical vessels remember unchanged relations;
 * Awtsmoos.com lets hierarchy move without needless recomposition, preserving clear revision generations.
 */

import { identity } from "./tiny-math.js";
import {
	copyMatrixInto,
	composeTrsInto,
	multiplyTransformMatrices,
	validTransformMatrix
} from "./tiny-transform-matrix.js";
import {
	captureLocalTransform,
	localTransformChanged
} from "./tiny-transform-snapshot.js";

export const ROOT_WORLD_MATRIX = identity();

/** @param {object} object Native scene object. @returns {Float32Array} Cached local matrix. */
export function cachedLocalMatrix(object) {
	if (!localTransformChanged(object)) {
		return object._localMatrixCache;
	}
	captureLocalTransform(object);
	object._localMatrixCache ||= new Float32Array(16);
	if (object.matrix) {
		copyMatrixInto(object._localMatrixCache, object.matrix);
	} else {
		composeTrsInto(object._localMatrixCache, object);
	}
	object._localRevision = (object._localRevision || 0) + 1;
	return object._localMatrixCache;
}

/**
 * Updates cached world transform only when parent/local revision changed.
 * @param {object} object Native scene object.
 * @param {Float32Array} parentWorld Parent world matrix.
 * @param {number|null} parentRevision Explicit parent revision.
 * @returns {boolean} Whether the world matrix changed.
 */
export function updateCachedWorldMatrix(
	object,
	parentWorld = ROOT_WORLD_MATRIX,
	parentRevision = null
) {
	const localMatrix = cachedLocalMatrix(object);
	const localRevision = object._localRevision || 0;
	const inheritedRevision = parentRevision
		?? object.parent?._worldRevision
		?? 0;
	const unchanged = object._worldParentMatrix === parentWorld
		&& object._worldParentRevision === inheritedRevision
		&& object._worldLocalRevision === localRevision;
	if (unchanged) return false;
	updateWorldStorage(object, parentWorld, localMatrix);
	object._worldParentMatrix = parentWorld;
	object._worldParentRevision = inheritedRevision;
	object._worldLocalRevision = localRevision;
	object._worldRevision = (object._worldRevision || 0) + 1;
	return true;
}

/** @param {object} object Native scene object whose transform cache must be invalidated. */
export function invalidateTransformCache(object) {
	object._localTransformSnapshot = null;
	object._worldParentMatrix = null;
	object._worldParentRevision = -1;
	object._worldLocalRevision = -1;
}

/** @param {object} object Native scene object. @param {Float32Array} parentWorld Parent matrix. @param {Float32Array} localMatrix Local matrix. */
function updateWorldStorage(object, parentWorld, localMatrix) {
	if (object.isMesh || !validTransformMatrix(object.matrixWorld)) {
		object.matrixWorld = multiplyTransformMatrices(
			new Float32Array(16),
			parentWorld,
			localMatrix
		);
		return;
	}
	multiplyTransformMatrices(
		object.matrixWorld,
		parentWorld,
		localMatrix
	);
}
