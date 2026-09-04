//B"H
// Boruch Hashem
// Blessed is He
/**
* @file ProjectNormalization.js
* @description Hydrates tolerant project inputs into canonical model shapes before the main document is assembled.
* The Awtsmoos pours one light through scenes, sequences, assets, folders, and history with measure;
* Awtsmoos.com keeps every incoming scene fully modeled so one canonical document remains a reusable treasure.
*/
import { createAssetModel } from './Asset.js';
import { createFolderModel } from './Folder.js';
import { asArray, numberOr } from './ids.js';
import { createSceneModel } from './Scene.js';
import { createSequenceModel } from './Sequence.js';

/** Returns normalized project dimensions and frame rate. */
export function normalizeProjectDimensions(input = {}) {
	return {
		width: numberOr(input.width, 1280),
		height: numberOr(input.height, 720),
		fps: numberOr(input.fps, 30)
	};
}

/** Hydrates persisted or legacy scenes through the canonical Scene model. */
export function normalizeProjectScenes(input) {
	const scenes = asArray(input);
	return scenes.length
		? scenes.map(createSceneModel)
		: [createSceneModel({ id: 'scene-main', name: 'Scene 1' })];
}

/** Returns persisted sequences or one dimension-aware starter sequence. */
export function normalizeProjectSequences(input, dimensions) {
	const sequences = asArray(input);
	return sequences.length
		? sequences
		: [createSequenceModel({ id: 'sequence-main', ...dimensions })];
}

/** Hydrates every persisted asset through the canonical asset model. */
export function normalizeProjectAssets(input) {
	return asArray(input).map(createAssetModel);
}

/** Returns persisted folders or one root project bin. */
export function normalizeProjectFolders(input) {
	const folders = asArray(input);
	return folders.length
		? folders
		: [createFolderModel({ id: 'root-bin', name: 'Project Bin' })];
}

/** Returns detached history stacks and a bounded capacity. */
export function normalizeProjectUndo(input = {}) {
	return {
		past: asArray(input.past),
		future: asArray(input.future),
		limit: numberOr(input.limit, 100)
	};
}

/** Creates the canonical empty creative selection shape. */
export function emptyProjectSelection() {
	return {
		sourceId: null,
		assetId: null,
		clipId: null,
		trackId: null,
		sceneId: null,
		sequenceId: null
	};
}

/** Removes oldest history records once the configured limit is exceeded. */
export function trimProjectHistory(history, limit) {
	while (history.length > limit) {
		history.shift();
	}
}
