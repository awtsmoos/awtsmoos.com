// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieScene3dRuntime.js
 * @description Resolves real authored objects and performs bounded object or raw vertex mutation.
 * The Awtsmoos renews object and point before hand or agent can move them; Awtsmoos.com
 * gives position, rotation, scale, mesh, and vertex edits one truthful runtime covenant.
 */

import { collectTargetMeshes, resolveMovieAuthoring3dTarget } from './MovieAuthoring3dTargets.js';
import {
	movieScene3dIndex,
	movieScene3dQuaternionToEuler,
	movieScene3dVector,
	movieScene3dVectorSnapshot,
	setMovieScene3dQuaternionFromEuler
} from './MovieScene3dMath.js';

export function movieScene3dState(session) {
	session.scene3dState ||= {
		meshIndex: 0,
		mode: 'object',
		modelId: session.project.authoring3d?.models?.[0]?.id || null,
		vertexIndices: []
	};
	return session.scene3dState;
}

export function movieScene3dModels(session) {
	return (session.project.authoring3d?.models || []).map(model => ({
		id: model.id,
		modelUrl: model.modelUrl || null,
		objectName: model.objectName || null,
		target: model.target || null
	}));
}

export function movieScene3dTarget(session) {
	const state = movieScene3dState(session);
	const model = session.project.authoring3d?.models?.find(item => item.id === state.modelId);
	if (!model) throw new Error('Select a valid 3D model first.');
	const target = resolveMovieAuthoring3dTarget(session.runtime, model);
	if (!target) throw new Error(`Runtime target ${model.id} is unavailable.`);
	return { model, state, target };
}

export function movieScene3dObjectSnapshot(session) {
	const { state, target } = movieScene3dTarget(session);
	return {
		meshCount: collectTargetMeshes(target).length,
		meshIndex: state.meshIndex,
		mode: state.mode,
		modelId: state.modelId,
		position: movieScene3dVectorSnapshot(target.position, [0, 0, 0]),
		rotation: movieScene3dQuaternionToEuler(target.quaternion),
		scale: movieScene3dVectorSnapshot(target.scale, [1, 1, 1]),
		vertexIndices: [...state.vertexIndices]
	};
}

export function setMovieScene3dTransform(session, patch = {}) {
	const { target } = movieScene3dTarget(session);
	if (patch.position) target.position?.set?.(...movieScene3dVector(patch.position));
	if (patch.scale) target.scale?.set?.(...movieScene3dVector(patch.scale, [1, 1, 1]));
	if (patch.rotation) setMovieScene3dQuaternionFromEuler(target.quaternion, patch.rotation);
	return movieScene3dObjectSnapshot(session);
}

export function movieScene3dMesh(session, meshIndex = null) {
	const { state, target } = movieScene3dTarget(session);
	const index = meshIndex == null ? state.meshIndex : movieScene3dIndex(meshIndex);
	const meshes = collectTargetMeshes(target);
	const mesh = meshes[index];
	if (!mesh) throw new Error(`Mesh index ${index} is unavailable.`);
	state.meshIndex = index;
	return { index, mesh, meshes };
}

export function movieScene3dVertices(session, options = {}) {
	const { index, mesh } = movieScene3dMesh(session, options.meshIndex);
	const position = mesh.geometry?.attributes?.position;
	if (!position?.array) throw new Error('Selected mesh has no editable position buffer.');
	const start = Math.max(0, movieScene3dIndex(options.start || 0));
	const count = Math.min(Number(options.count || 256), position.count - start);
	const vertices = [];
	for (let vertex = start; vertex < start + count; vertex += 1) {
		const offset = vertex * 3;
		vertices.push({ index: vertex, value: [position.array[offset], position.array[offset + 1], position.array[offset + 2]] });
	}
	return { count: position.count, meshIndex: index, start, vertices };
}

export function setMovieScene3dVertices(session, edits = []) {
	const { mesh } = movieScene3dMesh(session);
	const position = mesh.geometry?.attributes?.position;
	if (!position?.array) throw new Error('Selected mesh has no editable position buffer.');
	for (const edit of edits) {
		const index = movieScene3dIndex(edit.index);
		if (index >= position.count) throw new Error(`Vertex ${index} is unavailable.`);
		position.array.set(movieScene3dVector(edit.value), index * 3);
	}
	position.needsUpdate = true;
	mesh.geometry.userData ||= {};
	mesh.geometry.userData.manualVertexEdit = { edited: edits.length, status: 'executed' };
	return movieScene3dVertices(session, { count: Math.min(position.count, 256) });
}

export function moveMovieScene3dVertices(session, indices, delta) {
	const snapshot = movieScene3dVertices(session, { count: Number.MAX_SAFE_INTEGER });
	const selected = indices?.length ? indices : movieScene3dState(session).vertexIndices;
	const change = movieScene3dVector(delta);
	return setMovieScene3dVertices(session, selected.map(index => {
		const vertex = snapshot.vertices[index];
		if (!vertex) throw new Error(`Vertex ${index} is unavailable.`);
		return { index, value: vertex.value.map((value, axis) => value + change[axis]) };
	}));
}
