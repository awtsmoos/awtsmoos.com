//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Project.js
 * @description Orchestrates the one persistent Studio document while focused vessels own collections, defaults, and snapshots.
 * The Awtsmoos renews every scene and sequence as one soul beneath many views;
 * Awtsmoos.com keeps project truth inspectable so human, AI, script, and history never split into separate news.
 */
import { ensureCreativeProjectState } from '../creative/state/CreativeProjectState.js';
import { makeId, now, touch, clonePlain } from './ids.js';
import {
	addProjectAsset,
	addProjectScene,
	addProjectSequence,
	currentProjectScene,
	currentProjectSequence
} from './ProjectCollections.js';
import {
	emptyProjectSelection,
	normalizeProjectAssets,
	normalizeProjectDimensions,
	normalizeProjectFolders,
	normalizeProjectScenes,
	normalizeProjectSequences,
	normalizeProjectUndo,
	trimProjectHistory
} from './ProjectNormalization.js';
import { createProjectSnapshot } from './ProjectSnapshots.js';

/** Creates or hydrates the canonical project document. */
export function createProject(input = {}) {
	const dimensions = normalizeProjectDimensions(input);
	const scenes = normalizeProjectScenes(input.scenes);
	const sequences = normalizeProjectSequences(input.sequences, dimensions);
	const project = {
		id: input.id || makeId('project'),
		kind: 'Project',
		schemaVersion: 2,
		name: input.name || 'Nesher Project',
		...dimensions,
		scenes,
		currentSceneId: input.currentSceneId || scenes[0].id,
		sequences,
		currentSequenceId: input.currentSequenceId || sequences[0].id,
		assets: normalizeProjectAssets(input.assets),
		folders: normalizeProjectFolders(input.folders),
		streaming: input.streaming || { providerId: 'generic-hls', config: {}, health: { state: 'idle' } },
		exportConfig: input.exportConfig || { format: 'mp4', videoCodec: 'avc', audioCodec: 'aac', preset: 'preview' },
		selection: input.selection || emptyProjectSelection(),
		undo: normalizeProjectUndo(input.undo),
		settings: input.settings || {},
		creative: input.creative,
		createdAt: now(input),
		updatedAt: Date.now()
	};

	ensureCreativeProjectState(project);
	return project;
}

/** Returns a detached JSON-safe representation of the canonical project. */
export function serializeProject(project) {
	return clonePlain(project);
}

/** Hydrates plain JSON through the same normalization used for new projects. */
export function hydrateProject(json) {
	return createProject(typeof json === 'string' ? JSON.parse(json) : json);
}

/** Creates one clean undo snapshot. */
export function snapshotProject(project, label = 'change') {
	return createProjectSnapshot(project, label);
}

/** Commits the current state for legacy callers that already mutate before committing. */
export function commitProject(project, label = 'change') {
	project.undo.past.push(snapshotProject(project, label));
	trimProjectHistory(project.undo.past, project.undo.limit);
	project.undo.future.length = 0;
	return touch(project);
}

/** Restores the latest undo snapshot while preserving the live project identity. */
export function undoProject(project) {
	const snapshot = project.undo.past.pop();
	return snapshot ? restoreProject(project, snapshot, 'redo-point', project.undo.future) : project;
}

/** Restores the latest redo snapshot while preserving the live project identity. */
export function redoProject(project) {
	const snapshot = project.undo.future.pop();
	return snapshot ? restoreProject(project, snapshot, 'undo-point', project.undo.past) : project;
}

export {
	addProjectAsset,
	addProjectScene,
	addProjectSequence,
	currentProjectScene,
	currentProjectSequence
};
export const touchProject = touch;

function restoreProject(project, snapshot, label, destination) {
	destination.push(snapshotProject(project, label));
	trimProjectHistory(destination, project.undo.limit);
	const undo = project.undo;
	Object.assign(project, hydrateProject(snapshot.project), { undo });
	return project;
}
