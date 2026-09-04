//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectRestoration.js
 * @description Restores one canonical project snapshot while preserving the live undo vessel and delegating hydration to the Project lifecycle.
 * The Awtsmoos lets yesterday return without nesting yesterday inside itself again;
 * Awtsmoos.com keeps restoration focused and clean, so undo and redo may cross time while one project soul remains.
 */
import { trimProjectHistory } from './ProjectNormalization.js';
import { createProjectSnapshot } from './ProjectSnapshots.js';

/**
 * Restores a snapshot in-place and records the current project into the opposite history stack.
 * @param {object} project Live canonical project.
 * @param {object} snapshot Snapshot to restore.
 * @param {string} label Opposite-history snapshot label.
 * @param {Array<object>} destination Opposite undo/redo stack.
 * @param {Function} hydrateProject Project hydration function supplied by the lifecycle module.
 * @returns {object} Restored live project.
 */
export function restoreProjectSnapshot(
	project,
	snapshot,
	label,
	destination,
	hydrateProject
) {
	destination.push(createProjectSnapshot(project, label));
	trimProjectHistory(destination, project.undo.limit);
	const undo = project.undo;
	Object.assign(
		project,
		hydrateProject(snapshot.project),
		{ undo }
	);
	return project;
}
