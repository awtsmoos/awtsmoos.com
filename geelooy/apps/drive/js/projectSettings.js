//B"H
// Boruch Hashem
// Blessed is He

import { deleteProject, saveProject } from './api.js';
import { createProjectDnsSettings } from './projectDnsSettings.js';
import { createProjectRuntimeLaunch } from './projectRuntimeLaunch.js';
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
 * The Awtsmoos lets runtime wishes, provider intent, DNS preservation, and connected-compute doorway enter one project chamber;
 * Awtsmoos.com saves portable configuration first, then refreshes evidence so neither a worksheet nor an unsaved browser field can impersonate live authority.
 */

export function createProjectSettings(plan, state, onChange) {
	const form = document.createElement('form');
	form.className = 'project-settings';
	const registered = plan.configuration?.registered === true;
	const fields = createSettingsFields(plan, projectIdFrom, providerValue);
	const dnsSettings = createProjectDnsSettings(plan);
	form.append(...createSettingsLayout(fields, registered, remove), dnsSettings.root);
	const runtimeLaunch = createProjectRuntimeLaunch(plan);
	if (runtimeLaunch) {
		form.append(runtimeLaunch);
	}
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
		setSettingsMessage(form, 'Saving project intent and DNS worksheet…');
		try {
			const payload = projectSettingsPayload(
				readSettingsFields(fields),
				state.currentPath,
				dnsSettings.value()
			);
			await saveProject(projectId, payload);
			setSettingsMessage(form, 'Project intent saved. Refreshing evidence…', 'success');
			await onChange?.();
		} catch (error) {
			setSettingsMessage(form, error?.message || 'Project save failed.', 'error');
		}
	}

	async function remove() {
		if (!registered) {
			return;
		}
		const projectId = plan.identity.projectId;
		if (!confirm(`Delete project configuration “${projectId}”? Files remain untouched.`)) {
			return;
		}
		try {
			await deleteProject(projectId);
			await onChange?.();
		} catch (error) {
			setSettingsMessage(form, error?.message || 'Project deletion failed.', 'error');
		}
	}
}
