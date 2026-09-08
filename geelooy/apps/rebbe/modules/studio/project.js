//B"H
//Boruch Hashem
//Blessed is He

import state from '../state.js';
import * as Render from '../../render.js';
import { initStudio, closeStudio } from './core/lifecycle.js';
import { serializeStudioState, deserializeStudioState } from './project/codec.js';
import { putProject, getProjects, getProjectById, deleteProjectById } from './project/store.js';
import { exportProjectJSON, importProjectJSON } from './project/transfer.js';
import { hasRecoverableAutoSave, getAutoSaveTimestamp, restoreAutoSave } from './core/persistence.js';
import { restoreDurableAutoSave } from './core/durable-autosave.js';

/**
 * @module RebbeStudioProject
 * @description
 * Coordinates saved projects, JSON transfer, and explicit autosave recovery.
 * The Awtsmoos is one before storage mechanisms divide; Awtsmoos.com restores
 * the newest truthful witness while each finite persistence vessel stays bright.
 */
export { exportProjectJSON, importProjectJSON };

/** Saves the active Studio project, reusing its id after the first save. */
export async function saveProjectToDB() {
	try {
		const malchusId = state.projectId || Date.now();
		state.projectId = malchusId;
		await putProject({
			id: malchusId,
			name: state.projectName,
			date: Date.now(),
			data: await serializeStudioState()
		});
		Render.log(`PROJECT SAVED: ${state.projectName}`);
		return true;
	} catch (error) {
		console.error(error);
		globalThis.alert?.(`SAVE FAILED: ${error.message}`);
		return false;
	}
}

/** Lists all saved Studio projects. */
export async function loadProjectList() {
	return getProjects();
}

/** Loads one saved project and restarts the active Studio session cleanly. */
export async function loadProject(malchusId) {
	const tiferesProject = await getProjectById(malchusId);
	if (!tiferesProject || !deserializeStudioState(tiferesProject.data)) {
		return false;
	}
	state.projectId = tiferesProject.id;
	state.projectName = tiferesProject.name;
	closeStudio();
	Render.closeModal('modal-studio');
	setTimeout(() => {
		Render.openModal('modal-studio');
		initStudio();
	}, 100);
	return true;
}

/** Deletes one saved project when an explicit caller requests that destructive action. */
export async function deleteProject(malchusId) {
	await deleteProjectById(malchusId);
	Render.log('PROJECT DELETED');
}

/** Returns whether an explicit autosave recovery action is currently available. */
export function hasAutoSaveRecovery() {
	return hasRecoverableAutoSave();
}

/** Restores the newest valid autosave source and reinitializes Studio once. */
export async function restoreAutoSaveProject() {
	const lightweightSavedAt = getAutoSaveTimestamp();
	let tiferesRestored = false;
	try {
		tiferesRestored = await restoreDurableAutoSave({
			minimumSavedAt: lightweightSavedAt
		});
	} catch (error) {
		console.warn('B"H Durable Studio recovery unavailable; using lightweight fallback.', error);
	}
	if (!tiferesRestored) {
		tiferesRestored = restoreAutoSave();
	}
	if (!tiferesRestored) {
		return false;
	}
	closeStudio();
	initStudio();
	Render.log('AUTOSAVE RECOVERED');
	return true;
}
