// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiScene3d.js
 * @description Exposes durable object/edit modes, transforms, mesh discovery, and raw vertex mutation.
 * The Awtsmoos renews hand, history, and agent through one document truth; Awtsmoos.com lets
 * manual controls and scripts move the same object and vertices with autosave, export, undo, and redo.
 */
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import {
	moveMovieScene3dProjectVertices,
	setMovieScene3dProjectTransform,
	setMovieScene3dProjectVertices
} from './MovieScene3dProject.js';
import {
	movieScene3dModels,
	movieScene3dObjectSnapshot,
	movieScene3dState,
	movieScene3dVertices
} from './MovieScene3dRuntime.js';

export function createMovieStudioScene3dDomain(session) {
	return Object.freeze({
		catalog: () => snapshot({ modes: ['object', 'edit'], transformModes: ['translate', 'rotate', 'scale'], models: movieScene3dModels(session) }),
		mode: value => setMode(session, value),
		moveVertices: (indices, delta) => commitMovedVertices(session, indices, delta),
		selectMesh: index => selectMesh(session, index),
		selectModel: id => selectModel(session, id),
		selectVertices: indices => selectVertices(session, indices),
		snapshot: () => snapshot(movieScene3dObjectSnapshot(session)),
		transform: patch => commitTransform(session, patch),
		vertices: options => snapshot(movieScene3dVertices(session, options)),
		writeVertices: edits => commitVertices(session, edits)
	});
}

function commitTransform(session, patch) {
	const state = movieScene3dState(session);
	const current = movieScene3dObjectSnapshot(session);
	const complete = {
		position: patch.position || current.position,
		rotation: patch.rotation || current.rotation,
		scale: patch.scale || current.scale
	};
	commit(session, setMovieScene3dProjectTransform(session.project, state.modelId, complete), 'Transform 3D object');
	return snapshot(movieScene3dObjectSnapshot(session));
}

function commitVertices(session, edits) {
	const state = movieScene3dState(session);
	commit(session, setMovieScene3dProjectVertices(session.project, state.modelId, state.meshIndex, edits), 'Edit 3D vertices');
	return snapshot(movieScene3dVertices(session, { count: 256 }));
}

function commitMovedVertices(session, indices, delta) {
	const state = movieScene3dState(session);
	const current = movieScene3dVertices(session, { count: Number.MAX_SAFE_INTEGER, meshIndex: state.meshIndex });
	const selected = indices?.length ? indices : state.vertexIndices;
	const project = moveMovieScene3dProjectVertices(session.project, state.modelId, state.meshIndex, selected, delta, current.vertices);
	commit(session, project, 'Move 3D vertices');
	return snapshot(movieScene3dVertices(session, { count: 256 }));
}

function commit(session, project, label) {
	const state = { ...movieScene3dState(session) };
	session.commands.commitProject(project, label);
	Object.assign(movieScene3dState(session), state);
	session.seek(session.time);
}

function setMode(session, value) {
	if (!['object', 'edit'].includes(value)) throw new Error('3D mode must be object or edit.');
	movieScene3dState(session).mode = value;
	return snapshot(movieScene3dObjectSnapshot(session));
}

function selectModel(session, id) {
	if (!movieScene3dModels(session).some(model => model.id === id)) throw new Error(`3D model ${id} is unavailable.`);
	Object.assign(movieScene3dState(session), { meshIndex: 0, modelId: id, vertexIndices: [] });
	return snapshot(movieScene3dObjectSnapshot(session));
}

function selectMesh(session, index) {
	const state = movieScene3dState(session);
	state.meshIndex = Math.max(0, Math.floor(Number(index) || 0));
	state.vertexIndices = [];
	return snapshot(movieScene3dObjectSnapshot(session));
}

function selectVertices(session, indices = []) {
	movieScene3dState(session).vertexIndices = [...new Set(indices.map(value => Math.max(0, Math.floor(Number(value) || 0))))];
	return snapshot(movieScene3dObjectSnapshot(session));
}

function snapshot(value) {
	return createMovieProjectSnapshot(value);
}
