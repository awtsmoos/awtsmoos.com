//B"H
// Boruch Hashem
// Blessed is He
/**
* @file ProjectTransaction.js
* @description Captures portable pre-command project truth while runtime source handles survive rollback outside JSON history.
* The Awtsmoos lets change descend through Gevurah without severing the living media from the state it knew;
* Awtsmoos.com keeps rollback, Undo, aliases, and runtime oros returning through one identity path true.
*/
import { hydrateProject } from '../../project/Project.js';
import { trimProjectHistory } from '../../project/ProjectNormalization.js';
import { createProjectSnapshotData } from '../../project/ProjectSnapshots.js';
import { syncProjectFromState, syncStateFromProject } from '../../state.js';
import {
	pruneSourceRuntimeResources,
	rememberSourceRuntimeResources,
	restoreSourceRuntimeResources
} from './SourceRuntimeResourceLedger.js';

/** Begins one reversible creative command transaction with portable data plus runtime-handle memory. */
export function beginProjectTransaction(state, label = 'creative command') {
	syncProjectFromState(state);
	rememberSourceRuntimeResources(state);
	const project = state.project;
	const beforeProject = createProjectSnapshotData(project);
	const beforeUndo = captureUndo(project.undo);
	let closed = false;
	return {
		commit() {
			assertOpen(closed);
			project.undo.past.push({
				label,
				at: Date.now(),
				project: beforeProject
			});
			trimProjectHistory(project.undo.past, project.undo.limit);
			project.undo.future.length = 0;
			project.updatedAt = Date.now();
			closed = true;
			return project;
		},
		rollback() {
			if (closed) {
				return project;
			}
			const restored = hydrateProject(beforeProject);
			Object.assign(project, restored, {
				undo: restoreUndo(beforeUndo)
			});
			syncStateFromProject(state);
			restoreSourceRuntimeResources(state);
			pruneSourceRuntimeResources(state);
			closed = true;
			return project;
		}
	};
}

/** Captures shallow history record references without recursively snapshotting the snapshot stacks. */
function captureUndo(undo = {}) {
	return {
		past: [...(undo.past || [])],
		future: [...(undo.future || [])],
		limit: Number(undo.limit || 100)
	};
}

/** Recreates the existing undo vessel after rollback restores canonical document data. */
function restoreUndo(undo) {
	return {
		past: [...undo.past],
		future: [...undo.future],
		limit: undo.limit
	};
}

/** Prevents one transaction scope from being committed or rolled back twice. */
function assertOpen(closed) {
	if (closed) {
		throw new Error('Creative project transaction is already closed.');
	}
}
