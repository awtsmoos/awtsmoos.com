//B"H
// Boruch Hashem
// Blessed is He
/**
* @file ProjectUndoLifecycle.js
* @description Owns canonical project snapshots, commits, undo, and redo while document hydration remains in its separate lifecycle vessel.
* The Awtsmoos lets yesterday become reachable without nesting history inside history without end;
* Awtsmoos.com records one clean footprint per creative turn, so undo and redo may cross time and still defend.
*/
import { hydrateProject } from './ProjectDocument.js';
import { touch } from './ids.js';
import { trimProjectHistory } from './ProjectNormalization.js';
import { restoreProjectSnapshot } from './ProjectRestoration.js';
import { createProjectSnapshot } from './ProjectSnapshots.js';

/** Creates one clean undo snapshot with the existing legacy record shape. */
export function snapshotProject(project, label = 'change') {
	return createProjectSnapshot(project, label);
}

/** Commits one undo point, bounds history, clears redo, and marks the live project changed. */
export function commitProject(project, label = 'change') {
	project.undo.past.push(snapshotProject(project, label));
	trimProjectHistory(project.undo.past, project.undo.limit);
	project.undo.future.length = 0;
	return touch(project);
}

/** Restores the latest undo point in place while preserving the live undo vessel. */
export function undoProject(project) {
	const snapshot = project.undo.past.pop();
	return snapshot
		? restoreProjectSnapshot(
			project,
			snapshot,
			'redo-point',
			project.undo.future,
			hydrateProject
		)
		: project;
}

/** Restores the latest redo point in place while preserving the live undo vessel. */
export function redoProject(project) {
	const snapshot = project.undo.future.pop();
	return snapshot
		? restoreProjectSnapshot(
			project,
			snapshot,
			'undo-point',
			project.undo.past,
			hydrateProject
		)
		: project;
}
