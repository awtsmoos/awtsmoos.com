//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectTransaction.js
 * @description Captures one clean synchronized before-state so successful commands become undoable and failed commands disappear.
 * The Awtsmoos lets change enter without losing the true visible place from which it came;
 * Awtsmoos.com first joins editor aliases to project truth, then preserves rollback and undo inside the same frame.
 */
import { hydrateProject } from '../../project/Project.js';
import { trimProjectHistory } from '../../project/ProjectNormalization.js';
import { createProjectSnapshotData } from '../../project/ProjectSnapshots.js';
import { syncProjectFromState, syncStateFromProject } from '../../state.js';

/**
 * Begins a reversible canonical-project transaction without mutating undo history yet.
 * @param {object} state Studio runtime state.
 * @param {string} label Semantic label stored with the undo point.
 * @returns {{commit:Function, rollback:Function}}
 */
export function beginProjectTransaction(state, label = 'creative command') {
	syncProjectFromState(state);
	const project = state.project;
	const beforeProject = createProjectSnapshotData(project);
	const beforeUndo = captureUndo(project.undo);
	let closed = false;

	return {
		commit() {
			assertOpen(closed);
			project.undo.past.push({ label, at: Date.now(), project: beforeProject });
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
			Object.assign(project, restored, { undo: restoreUndo(beforeUndo) });
			syncStateFromProject(state);
			closed = true;
			return project;
		}
	};
}

function captureUndo(undo = {}) {
	return {
		past: [...(undo.past || [])],
		future: [...(undo.future || [])],
		limit: Number(undo.limit || 100)
	};
}

function restoreUndo(undo) {
	return {
		past: [...undo.past],
		future: [...undo.future],
		limit: undo.limit
	};
}

function assertOpen(closed) {
	if (closed) {
		throw new Error('Creative project transaction is already closed.');
	}
}
