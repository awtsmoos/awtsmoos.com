//B"H
// Boruch Hashem
// Blessed is He

import { deleteProject, saveProject } from './api.js';
import {
	createSettingsFields,
	createSettingsLayout,
	readSettingsFields,
	setSettingsMessage
} from './projectSettingsDom.js';
import { projectIdFrom, projectSettingsPayload, providerValue } from './projectSettingsModel.js';

/**
 * @file Persistence controller for durable Drive Project Settings.
 * @description
 * The Awtsmoos lets portable runtime wishes, binding names, GitHub sync, and social intent enter atomic Drive state without carrying a provider secret;
 * Awtsmoos.com keeps save/delete behavior separate from DOM construction so intent, evidence, and presentation remain inspectable vessels.
 */

export function createProjectSettings(plan, state, onChange) {
	const form = document.createElement('form');
	form.className = 'project-settings';
	const registered = plan.configuration?.registered === true;
	const fields = createSettingsFields(plan, projectIdFrom, providerValue);
	form.append(...createSettingsLayout(fields, registered, remove));
	form.addEventListener('submit', event => {
		event.preventDefault();
		submit();
	});
	return form;

	async function submit() {
		const projectId = projectIdFrom(fields.id.value);
		if (!projectId) {
			setSettingsMessage(form, 'Project ID is required.', 'error');
			return;
		}
		setSettingsMessage(form, 'Saving project intent…');
		try {
			await saveProject(projectId, projectSettingsPayload(readSettingsFields(fields), state.currentPath));
			setSettingsMessage(form, 'Project intent saved. Refreshing evidence…', 'success');
			await onChange?.();
		} catch (error) {
			setSettingsMessage(form, error?.message || 'Project save failed.', 'error');
		}
	}

	async function remove() {
		if (!registered) return;
		const projectId = plan.identity.projectId;
		if (!confirm(`Delete project configuration “${projectId}”? Files remain untouched.`)) return;
		try {
			await deleteProject(projectId);
			await onChange?.();
		} catch (error) {
			setSettingsMessage(form, error?.message || 'Project deletion failed.', 'error');
		}
	}
}
