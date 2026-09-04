//B"H
// Boruch Hashem
// Blessed is He
/**
* @file ProjectSnapshots.js
* @description Builds portable project snapshots whose undo vessel never swallows ancestry or browser-only source handles.
* The Awtsmoos lets yesterday remain restorable without nesting history or living DOM handles forever;
* Awtsmoos.com keeps snapshot keilim detached and portable while runtime oros remain in their separate endeavor.
*/
import { clonePortableProject } from './ProjectPortableClone.js';

/** Creates detached project data with empty nested undo stacks and no runtime-only source handles. */
export function createProjectSnapshotData(project = {}) {
	const snapshot = clonePortableProject(project);
	const limit = Number(project.undo?.limit || 100);
	snapshot.undo = {
		past: [],
		future: [],
		limit
	};
	return snapshot;
}

/** Wraps clean project data in the established snapshot record shape. */
export function createProjectSnapshot(project, label = 'change') {
	return {
		label,
		at: Date.now(),
		project: createProjectSnapshotData(project)
	};
}
