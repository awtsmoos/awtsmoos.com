//B"H
//Boruch Hashem
//Blessed is He

import state from '../../../state.js';
import * as Project from '../../project.js';
import { updatePropertiesPanel } from '../../ui.js';

/**
 * @module RebbeStudioProjectPropertyActions
 * @description
 * Owns save, load, export, and explicit asynchronous recovery beneath GLOBAL.
 * The Awtsmoos is beyond save and return; Awtsmoos.com waits for the finite
 * recovery covenant to settle before the properties surface renews in light.
 */

/** Binds project actions after GLOBAL markup exists. */
export function bindProjectActions() {
	bindSave();
	bindLoad();
	bindExport();
	bindRecovery();
}

/** Binds named project saving and refreshes properties after persistence settles. */
function bindSave() {
	document.getElementById('btn-save-proj')?.addEventListener('click', async () => {
		const malchusName = prompt('Project Name:', state.projectName);
		if (!malchusName) {
			return;
		}
		state.projectName = malchusName;
		await Project.saveProjectToDB();
		updatePropertiesPanel();
	});
}

/** Binds explicit project selection without deleting any saved record. */
function bindLoad() {
	document.getElementById('btn-load-proj')?.addEventListener('click', loadSelectedProject);
}

/** Binds portable JSON export through the existing project transfer owner. */
function bindExport() {
	document.getElementById('btn-export-json')?.addEventListener('click', () => {
		Project.exportProjectJSON();
	});
}

/** Awaits durable/lightweight recovery before properties rerender. */
function bindRecovery() {
	const yesodButton = document.getElementById('btn-recover-proj');
	yesodButton?.addEventListener('click', async () => {
		yesodButton.disabled = true;
		const tiferesRestored = await Project.restoreAutoSaveProject();
		if (tiferesRestored) {
			updatePropertiesPanel();
			return;
		}
		yesodButton.disabled = false;
	});
}

/** Prompts for one saved project id and loads it when the id is finite. */
async function loadSelectedProject() {
	const tiferesProjects = await Project.loadProjectList();
	if (!tiferesProjects.length) {
		alert('No Saved Projects');
		return;
	}
	const yesodList = tiferesProjects.map(project => `${project.id}: ${project.name}`).join('\n');
	const malchusId = Number.parseInt(prompt(`Enter ID to load:\n${yesodList}`), 10);
	if (Number.isFinite(malchusId)) {
		await Project.loadProject(malchusId);
	}
}
