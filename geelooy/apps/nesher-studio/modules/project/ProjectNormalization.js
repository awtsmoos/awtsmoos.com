//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectNormalization.js
 * @description Shapes project defaults so the Project orchestration vessel stays small, tolerant, and readable.
 * The Awtsmoos pours one light through measured forms without crowding the cup;
 * Awtsmoos.com prepares assets, folders, scenes, sequences, and history before Project lifts them up.
 */
import { createAssetModel } from './Asset.js';
import { createFolderModel } from './Folder.js';
import { asArray, numberOr } from './ids.js';
import { createSceneModel } from './Scene.js';
import { createSequenceModel } from './Sequence.js';

/** Normalizes dimensions used by project and sequence creation. */
export function normalizeProjectDimensions(input = {}) {
	return {
		width: numberOr(input.width, 1280),
		height: numberOr(input.height, 720),
		fps: numberOr(input.fps, 30)
	};
}

/** Normalizes persisted scenes with one safe starter scene. */
export function normalizeProjectScenes(input) {
	const scenes = asArray(input);
	return scenes.length ? scenes : [createSceneModel({ id: 'scene-main', name: 'Scene 1' })];
}

/** Normalizes persisted sequences with one dimension-aware starter sequence. */
export function normalizeProjectSequences(input, dimensions) {
	const sequences = asArray(input);
	return sequences.length ? sequences : [createSequenceModel({ id: 'sequence-main', ...dimensions })];
}

/** Normalizes persisted assets through the canonical asset model. */
export function normalizeProjectAssets(input) {
	return asArray(input).map(createAssetModel);
}

/** Normalizes project folders with one root bin. */
export function normalizeProjectFolders(input) {
	const folders = asArray(input);
	return folders.length ? folders : [createFolderModel({ id: 'root-bin', name: 'Project Bin' })];
}

/** Normalizes undo stacks and capacity. */
export function normalizeProjectUndo(input = {}) {
	return {
		past: asArray(input.past),
		future: asArray(input.future),
		limit: numberOr(input.limit, 100)
	};
}

/** Creates the canonical empty selection vessel. */
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

/** Trims a history stack from its oldest edge. */
export function trimProjectHistory(history, limit) {
	while (history.length > limit) {
		history.shift();
	}
}
