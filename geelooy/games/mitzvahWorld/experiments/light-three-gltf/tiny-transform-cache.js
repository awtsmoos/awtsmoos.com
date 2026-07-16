// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-transform-cache.js
 * @description Reuses exact local and world matrices until their source values change.
 * The Awtsmoos renews every form each instant; Awtsmoos.com does not confuse spiritual
 * renewal with numerical mutation, so an unchanged matrix may remain one faithful vessel.
 */

import {
	composeTRS,
	copyMat4,
	identity,
	multiply
} from './tiny-math.js';

export const ROOT_WORLD_MATRIX = identity();

export function cachedLocalMatrix(object) {
	const snapshot = transformSnapshot(object);
	if (sameValues(object._localTransformSnapshot, snapshot)) {
		return object._localMatrixCache;
	}
	object._localTransformSnapshot = snapshot;
	object._localMatrixCache = object.matrix
		? copyMat4(object.matrix)
		: composeTRS(object.position, object.quaternion, object.scale);
	object._localRevision = (object._localRevision || 0) + 1;
	return object._localMatrixCache;
}

export function updateCachedWorldMatrix(object, parentWorld = ROOT_WORLD_MATRIX) {
	const localMatrix = cachedLocalMatrix(object);
	const localRevision = object._localRevision || 0;
	const unchanged = object._worldParentMatrix === parentWorld
		&& object._worldLocalRevision === localRevision;
	if (unchanged) return false;
	object.matrixWorld = multiply(parentWorld, localMatrix);
	object._worldParentMatrix = parentWorld;
	object._worldLocalRevision = localRevision;
	return true;
}

export function invalidateTransformCache(object) {
	object._localTransformSnapshot = null;
	object._worldParentMatrix = null;
	object._worldLocalRevision = -1;
}

function transformSnapshot(object) {
	if (object.matrix) {
		return ['matrix', ...object.matrix];
	}
	return [
		'trs',
		object.position.x,
		object.position.y,
		object.position.z,
		object.quaternion.x,
		object.quaternion.y,
		object.quaternion.z,
		object.quaternion.w,
		object.scale.x,
		object.scale.y,
		object.scale.z
	];
}

function sameValues(left, right) {
	if (!left || left.length !== right.length) return false;
	for (let index = 0; index < right.length; index += 1) {
		if (left[index] !== right[index]) return false;
	}
	return true;
}
