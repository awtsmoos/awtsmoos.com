// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieScene3dProject.js
 * @description Stores durable object transforms and raw vertex edits inside canonical authoring JSON.
 * The Awtsmoos renews runtime and document through one present truth; Awtsmoos.com lets
 * manual movement survive reload, autosave, export, undo, redo, rendering, and agent execution.
 */

export function setMovieScene3dProjectTransform(project, modelId, patch = {}) {
	const next = clone(project);
	const model = requireModel(next, modelId);
	model.manualTransform = {
		position: vector(patch.position, model.manualTransform?.position || [0, 0, 0]),
		rotation: vector(patch.rotation, model.manualTransform?.rotation || [0, 0, 0]),
		scale: vector(patch.scale, model.manualTransform?.scale || [1, 1, 1])
	};
	return next;
}

export function setMovieScene3dProjectVertices(project, modelId, meshIndex, edits = []) {
	const next = clone(project);
	const model = requireModel(next, modelId);
	const existing = new Map((model.vertexEdits || []).map(edit => [
		vertexKey(edit.meshIndex, edit.index),
		edit
	]));
	for (const edit of edits) {
		const normalized = {
			index: index(edit.index),
			meshIndex: index(meshIndex),
			value: vector(edit.value)
		};
		existing.set(vertexKey(normalized.meshIndex, normalized.index), normalized);
	}
	model.vertexEdits = [...existing.values()].sort((left, right) => {
		return left.meshIndex - right.meshIndex || left.index - right.index;
	});
	return next;
}

export function moveMovieScene3dProjectVertices(
	project,
	modelId,
	meshIndex,
	indices,
	delta,
	vertices
) {
	const change = vector(delta);
	const lookup = new Map(vertices.map(vertex => [vertex.index, vertex.value]));
	const edits = indices.map(value => {
		const vertexIndex = index(value);
		const current = lookup.get(vertexIndex);
		if (!current) throw new Error(`Vertex ${vertexIndex} is unavailable.`);
		return {
			index: vertexIndex,
			value: current.map((coordinate, axis) => coordinate + change[axis])
		};
	});
	return setMovieScene3dProjectVertices(project, modelId, meshIndex, edits);
}

export function movieScene3dProjectModel(project, modelId) {
	return project.authoring3d?.models?.find(model => model.id === modelId) || null;
}

function requireModel(project, modelId) {
	const model = movieScene3dProjectModel(project, modelId);
	if (!model) throw new Error(`3D model ${modelId} is unavailable.`);
	return model;
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

function vector(value, fallback = [0, 0, 0]) {
	return Array.isArray(value) ? value.map(Number) : [...fallback];
}

function index(value) {
	return Math.max(0, Math.floor(Number(value) || 0));
}

function vertexKey(meshIndex, vertexIndex) {
	return `${meshIndex}:${vertexIndex}`;
}
