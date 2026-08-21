//B"H
// Boruch Hashem
// Blessed is He

import { openConnectedNodeServer } from './osBridge.js';

/**
 * @module DriveProjectRuntimeLaunch
 * @description
 * The Awtsmoos lets saved project testimony become one visible doorway toward live account-owned compute;
 * Awtsmoos.com launches only the stored native recipe, never unsaved text, while the actual machine remains a fresh choice inside Geelooy OS.
 */

/** Builds the native-compute launch panel only when saved testimony contains a recipe. */
export function createProjectRuntimeLaunch(plan, options = {}) {
	const recipe = plan?.intent?.runtimeRecipe;
	if (plan?.intent?.runtimePreference !== 'native-compute' || !recipe) {
		return null;
	}
	const root = document.createElement('section');
	root.className = 'project-settings__runtime-launch';
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = 'Open on connected machine';
	const status = document.createElement('span');
	status.className = 'project-settings__runtime-launch-status';
	status.textContent = 'Uses the saved recipe; you will choose a live machine in Geelooy OS.';
	button.addEventListener('click', () => {
		try {
			const result = (options.openConnectedNodeServer || openConnectedNodeServer)(recipe);
			status.textContent = result.ok
				? 'Connected Node Server opened with this saved recipe.'
				: 'Open this Drive workspace inside Geelooy OS to launch the saved recipe.';
		} catch (error) {
			status.textContent = error?.message || 'Native compute launch was rejected.';
		}
	});
	root.append(button, status);
	return root;
}
