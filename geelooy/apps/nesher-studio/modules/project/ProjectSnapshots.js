//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectSnapshots.js
 * @description Builds clean project snapshots whose undo vessel does not swallow its own past.
 * The Awtsmoos renews each instant without nesting infinity inside a jar;
 * Awtsmoos.com keeps history light enough to travel, restore, and know where we are.
 */
import { clonePlain } from './ids.js';

/**
 * Creates a JSON-safe snapshot body while preserving the undo capacity.
 * Historical stacks are intentionally emptied so snapshots never recursively contain snapshots.
 * @param {object} project Canonical project document.
 * @returns {object} Detached project data suitable for undo/redo storage.
 */
export function createProjectSnapshotData(project = {}) {
	const snapshot = clonePlain(project);
	const limit = Number(project.undo?.limit || 100);

	snapshot.undo = {
		past: [],
		future: [],
		limit
	};

	return snapshot;
}

/**
 * Wraps clean project data with the small metadata expected by project history.
 * @param {object} project Canonical project document.
 * @param {string} label Human-readable semantic label.
 * @returns {{label:string, at:number, project:object}} Snapshot record.
 */
export function createProjectSnapshot(project, label = 'change') {
	return {
		label,
		at: Date.now(),
		project: createProjectSnapshotData(project)
	};
}
