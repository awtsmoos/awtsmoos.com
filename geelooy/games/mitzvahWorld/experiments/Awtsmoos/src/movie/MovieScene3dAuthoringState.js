// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieScene3dAuthoringState.js
 * @description Remembers automatic runtime baselines so manual edits can be applied and removed without residue.
 * The Awtsmoos renews before and after inside one present frame; Awtsmoos.com preserves
 * automatic transforms and vertices beneath durable manual authoring so undo can reveal them exactly.
 */

import {
	movieScene3dQuaternionToEuler,
	movieScene3dVectorSnapshot,
	setMovieScene3dQuaternionFromEuler
} from './MovieScene3dMath.js';

const RUNTIME_STATES = new WeakMap();

export function movieScene3dAuthoringState(target) {
	if (!RUNTIME_STATES.has(target)) {
		RUNTIME_STATES.set(target, {
			activeVertexKeys: new Set(),
			lastTransform: null,
			lastVertices: new Map(),
			transformActive: false,
			transformBaseline: null,
			vertexBaselines: new Map()
		});
	}
	return RUNTIME_STATES.get(target);
}

export function movieScene3dTransformSnapshot(target) {
	return {
		position: movieScene3dVectorSnapshot(target.position, [0, 0, 0]),
		rotation: movieScene3dQuaternionToEuler(target.quaternion),
		scale: movieScene3dVectorSnapshot(target.scale, [1, 1, 1])
	};
}

export function writeMovieScene3dTransform(target, transform) {
	if (transform.position) target.position?.set?.(...transform.position);
	if (transform.scale) target.scale?.set?.(...transform.scale);
	if (transform.rotation) {
		setMovieScene3dQuaternionFromEuler(target.quaternion, transform.rotation);
	}
}

export function sameMovieScene3dTransform(left, right) {
	return Boolean(right)
		&& sameMovieScene3dVector(left.position, right.position)
		&& sameMovieScene3dVector(left.rotation, right.rotation)
		&& sameMovieScene3dVector(left.scale, right.scale);
}

export function sameMovieScene3dVector(left, right) {
	return Array.isArray(right)
		&& left.every((value, axis) => Math.abs(value - right[axis]) < 1e-9);
}

export function readMovieScene3dVertex(position, vertexIndex) {
	return Array.from(position.array.slice(
		vertexIndex * 3,
		vertexIndex * 3 + 3
	));
}

export function movieScene3dAuthoringIndex(value) {
	return Math.max(0, Math.floor(Number(value) || 0));
}

export function movieScene3dVertexKey(meshIndex, vertexIndex) {
	return `${movieScene3dAuthoringIndex(meshIndex)}:${movieScene3dAuthoringIndex(vertexIndex)}`;
}
