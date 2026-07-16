// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-transform-cache.js
 * @description Reuses transform snapshots and matrix storage until source values change.
 * The Awtsmoos renews every form each instant; Awtsmoos.com mutates stable numerical
 * vessels for moving hierarchy nodes while mesh matrix identity still invalidates batches.
 */

import { identity } from './tiny-math.js';

const MATRIX_SNAPSHOT = 1;
const TRS_SNAPSHOT = 2;

export const ROOT_WORLD_MATRIX = identity();

export function cachedLocalMatrix(object) {
	if (!localTransformChanged(object)) return object._localMatrixCache;
	captureLocalTransform(object);
	object._localMatrixCache ||= new Float32Array(16);
	if (object.matrix) copyMatrixInto(object._localMatrixCache, object.matrix);
	else composeTrsInto(object._localMatrixCache, object);
	object._localRevision = (object._localRevision || 0) + 1;
	return object._localMatrixCache;
}

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
	if (object.isMesh || !validMatrix(object.matrixWorld)) {
		object.matrixWorld = multiplyInto(
			new Float32Array(16),
			parentWorld,
			localMatrix
		);
	} else {
		multiplyInto(object.matrixWorld, parentWorld, localMatrix);
	}
	object._worldParentMatrix = parentWorld;
	object._worldParentRevision = inheritedRevision;
	object._worldLocalRevision = localRevision;
	object._worldRevision = (object._worldRevision || 0) + 1;
	return true;
}

export function invalidateTransformCache(object) {
	object._localTransformSnapshot = null;
	object._worldParentMatrix = null;
	object._worldParentRevision = -1;
	object._worldLocalRevision = -1;
}

function localTransformChanged(object) {
	const snapshot = object._localTransformSnapshot;
	if (object.matrix) {
		if (!snapshot || snapshot.length !== 17 || snapshot[0] !== MATRIX_SNAPSHOT) {
			return true;
		}
		for (let index = 0; index < 16; index += 1) {
			if (snapshot[index + 1] !== object.matrix[index]) return true;
		}
		return false;
	}
	if (!snapshot || snapshot.length !== 11 || snapshot[0] !== TRS_SNAPSHOT) {
		return true;
	}
	return snapshot[1] !== object.position.x
		|| snapshot[2] !== object.position.y
		|| snapshot[3] !== object.position.z
		|| snapshot[4] !== object.quaternion.x
		|| snapshot[5] !== object.quaternion.y
		|| snapshot[6] !== object.quaternion.z
		|| snapshot[7] !== object.quaternion.w
		|| snapshot[8] !== object.scale.x
		|| snapshot[9] !== object.scale.y
		|| snapshot[10] !== object.scale.z;
}

function captureLocalTransform(object) {
	if (object.matrix) {
		const snapshot = reusableSnapshot(object, 17);
		snapshot[0] = MATRIX_SNAPSHOT;
		for (let index = 0; index < 16; index += 1) {
			snapshot[index + 1] = object.matrix[index];
		}
		return;
	}
	const snapshot = reusableSnapshot(object, 11);
	snapshot[0] = TRS_SNAPSHOT;
	snapshot[1] = object.position.x;
	snapshot[2] = object.position.y;
	snapshot[3] = object.position.z;
	snapshot[4] = object.quaternion.x;
	snapshot[5] = object.quaternion.y;
	snapshot[6] = object.quaternion.z;
	snapshot[7] = object.quaternion.w;
	snapshot[8] = object.scale.x;
	snapshot[9] = object.scale.y;
	snapshot[10] = object.scale.z;
}

function reusableSnapshot(object, length) {
	if (!object._localTransformSnapshot || object._localTransformSnapshot.length !== length) {
		object._localTransformSnapshot = new Array(length);
	}
	return object._localTransformSnapshot;
}

function copyMatrixInto(target, source) {
	for (let index = 0; index < 16; index += 1) target[index] = source[index];
}

function composeTrsInto(target, object) {
	const quaternion = object.quaternion;
	const x = quaternion.x || 0;
	const y = quaternion.y || 0;
	const z = quaternion.z || 0;
	const w = quaternion.w ?? 1;
	const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
	const normalizedX = x * inverseLength;
	const normalizedY = y * inverseLength;
	const normalizedZ = z * inverseLength;
	const normalizedW = w * inverseLength;
	const x2 = normalizedX + normalizedX;
	const y2 = normalizedY + normalizedY;
	const z2 = normalizedZ + normalizedZ;
	const xx = normalizedX * x2;
	const xy = normalizedX * y2;
	const xz = normalizedX * z2;
	const yy = normalizedY * y2;
	const yz = normalizedY * z2;
	const zz = normalizedZ * z2;
	const wx = normalizedW * x2;
	const wy = normalizedW * y2;
	const wz = normalizedW * z2;
	target[0] = (1 - yy - zz) * object.scale.x;
	target[1] = (xy + wz) * object.scale.x;
	target[2] = (xz - wy) * object.scale.x;
	target[3] = 0;
	target[4] = (xy - wz) * object.scale.y;
	target[5] = (1 - xx - zz) * object.scale.y;
	target[6] = (yz + wx) * object.scale.y;
	target[7] = 0;
	target[8] = (xz + wy) * object.scale.z;
	target[9] = (yz - wx) * object.scale.z;
	target[10] = (1 - xx - yy) * object.scale.z;
	target[11] = 0;
	target[12] = object.position.x;
	target[13] = object.position.y;
	target[14] = object.position.z;
	target[15] = 1;
}

function multiplyInto(target, left, right) {
	for (let column = 0; column < 4; column += 1) {
		const offset = column * 4;
		const right0 = right[offset];
		const right1 = right[offset + 1];
		const right2 = right[offset + 2];
		const right3 = right[offset + 3];
		target[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
		target[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
		target[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
		target[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
	}
	return target;
}

function validMatrix(matrix) {
	return matrix?.length === 16;
}
