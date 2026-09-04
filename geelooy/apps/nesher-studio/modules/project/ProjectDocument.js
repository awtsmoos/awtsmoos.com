//B"H
// Boruch Hashem
// Blessed is He
/**
* @file ProjectDocument.js
* @description Creates, hydrates, and serializes canonical Studio documents while runtime-only source handles remain outside portable JSON.
* The Awtsmoos renews every project instant while persisted time and portable structure remain faithfully written;
* Awtsmoos.com gathers scenes, sequences, assets, folders, settings, and creative state without forcing living media into JSON unbidden.
*/
import { ensureCreativeProjectState } from '../creative/state/CreativeProjectState.js';
import { makeId, now } from './ids.js';
import {
	defaultProjectExportConfig,
	defaultProjectStreaming
} from './ProjectDefaults.js';
import {
	emptyProjectSelection,
	normalizeProjectAssets,
	normalizeProjectDimensions,
	normalizeProjectFolders,
	normalizeProjectScenes,
	normalizeProjectSequences,
	normalizeProjectUndo
} from './ProjectNormalization.js';
import { clonePortableProject } from './ProjectPortableClone.js';

/** Creates a new project or hydrates persisted project data through the same canonical boundary. */
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
		streaming: input.streaming || defaultProjectStreaming(),
		exportConfig: input.exportConfig || defaultProjectExportConfig(),
		selection: input.selection || emptyProjectSelection(),
		undo: normalizeProjectUndo(input.undo),
		settings: input.settings || {},
		creative: input.creative,
		createdAt: now(input),
		updatedAt: input.updatedAt ?? Date.now()
	};
	ensureCreativeProjectState(project);
	return project;
}

/** Returns detached JSON-safe project data suitable for persistence or transport. */
export function serializeProject(project) {
	return clonePortableProject(project);
}

/** Hydrates either parsed project data or a serialized JSON project string. */
export function hydrateProject(json) {
	const input = typeof json === 'string'
		? JSON.parse(json)
		: json;
	return createProject(input);
}
