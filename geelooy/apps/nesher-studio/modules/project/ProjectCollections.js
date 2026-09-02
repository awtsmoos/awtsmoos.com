//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectCollections.js
 * @description Owns focused mutations and lookups for the canonical project's major creative collections.
 * The Awtsmoos lets scenes, sequences, and assets enter one scroll through measured gates;
 * Awtsmoos.com keeps Project.js light while every collection mutation still touches the same project state.
 */
import { createAssetModel } from './Asset.js';
import { touch } from './ids.js';
import { createSceneModel } from './Scene.js';
import { createSequenceModel } from './Sequence.js';

/** Creates, selects, and returns one canonical scene. */
export function addProjectScene(project, scene = {}) {
	const model = createSceneModel(scene);
	project.scenes.push(model);
	project.currentSceneId = model.id;
	project.selection.sceneId = model.id;
	touch(project);
	return model;
}

/** Creates, selects, and returns one canonical sequence. */
export function addProjectSequence(project, sequence = {}) {
	const model = createSequenceModel({
		width: project.width,
		height: project.height,
		fps: project.fps,
		...sequence
	});
	project.sequences.push(model);
	project.currentSequenceId = model.id;
	project.selection.sequenceId = model.id;
	touch(project);
	return model;
}

/** Creates, selects, and returns one canonical asset. */
export function addProjectAsset(project, asset = {}) {
	const model = createAssetModel(asset);
	project.assets.push(model);
	project.selection.assetId = model.id;
	touch(project);
	return model;
}

/** Returns the current scene with a safe first-scene fallback. */
export function currentProjectScene(project) {
	return project.scenes.find((scene) => scene.id === project.currentSceneId) || project.scenes[0];
}

/** Returns the current sequence with a safe first-sequence fallback. */
export function currentProjectSequence(project) {
	return project.sequences.find((sequence) => sequence.id === project.currentSequenceId) || project.sequences[0];
}
