// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieScene3dAuthoringRuntime.js
 * @description Reapplies durable manual transforms and vertex edits while restoring removed edits exactly.
 * The Awtsmoos renews frame and document without residue; Awtsmoos.com lets manual work
 * survive playback and rendering, then lets undo reveal the automatic frame beneath it.
 */

import { collectTargetMeshes } from './MovieAuthoring3dTargets.js';
import {
	movieScene3dAuthoringIndex,
	movieScene3dAuthoringState,
	movieScene3dTransformSnapshot,
	movieScene3dVertexKey,
	readMovieScene3dVertex,
	sameMovieScene3dTransform,
	sameMovieScene3dVector,
	writeMovieScene3dTransform
} from './MovieScene3dAuthoringState.js';

export function applyMovieScene3dAuthoring(target, model) {
	if (!target || !model) return null;
	const state = movieScene3dAuthoringState(target);
	applyTransform(target, model.manualTransform, state);
	const vertexEdits = applyVertexEdits(
		target,
		model.vertexEdits || [],
		state
	);
	const evidence = {
		manualTransform: model.manualTransform || null,
		vertexEdits
	};
	target.userData ||= {};
	if (Object.isExtensible(target.userData)) {
		target.userData.movieScene3dAuthoring = evidence;
	}
	return evidence;
}

function applyTransform(target, transform, state) {
	const current = movieScene3dTransformSnapshot(target);
	if (!transform) {
		if (state.transformActive && state.transformBaseline) {
			writeMovieScene3dTransform(target, state.transformBaseline);
		}
		state.transformActive = false;
		state.lastTransform = null;
		return;
	}
	if (!state.transformActive
		|| !sameMovieScene3dTransform(current, state.lastTransform)) {
		state.transformBaseline = current;
	}
	writeMovieScene3dTransform(target, transform);
	state.lastTransform = movieScene3dTransformSnapshot(target);
	state.transformActive = true;
}

function applyVertexEdits(target, edits, state) {
	const meshes = collectTargetMeshes(target);
	const requested = new Set(edits.map(edit => {
		return movieScene3dVertexKey(edit.meshIndex, edit.index);
	}));
	for (const key of state.activeVertexKeys) {
		if (!requested.has(key)) restoreVertex(meshes, key, state);
	}
	let applied = 0;
	for (const edit of edits) {
		if (applyVertexEdit(meshes, edit, state)) applied += 1;
	}
	state.activeVertexKeys = requested;
	return { applied, requested: edits.length };
}

function applyVertexEdit(meshes, edit, state) {
	const meshIndex = movieScene3dAuthoringIndex(edit.meshIndex);
	const vertexIndex = movieScene3dAuthoringIndex(edit.index);
	const key = movieScene3dVertexKey(meshIndex, vertexIndex);
	const position = meshes[meshIndex]?.geometry?.attributes?.position;
	if (!position?.array || vertexIndex >= position.count) return false;
	const current = readMovieScene3dVertex(position, vertexIndex);
	if (!state.activeVertexKeys.has(key)
		|| !sameMovieScene3dVector(current, state.lastVertices.get(key))) {
		state.vertexBaselines.set(key, current);
	}
	const value = edit.value.map(Number);
	position.array.set(value, vertexIndex * 3);
	position.needsUpdate = true;
	state.lastVertices.set(key, value);
	return true;
}

function restoreVertex(meshes, key, state) {
	const [meshIndex, vertexIndex] = key.split(':').map(Number);
	const position = meshes[meshIndex]?.geometry?.attributes?.position;
	const baseline = state.vertexBaselines.get(key);
	if (position?.array && baseline && vertexIndex < position.count) {
		position.array.set(baseline, vertexIndex * 3);
		position.needsUpdate = true;
	}
	state.lastVertices.delete(key);
}
