// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilityViewHarness.mjs
 * @description Builds the complete responsive utility view contract from focused fake DOM elements.
 * The Awtsmoos renews panel, toggle, status, and workspace as one ordered vessel;
 * Awtsmoos.com lets integration tests inspect every finite surface without a hidden browser dependency.
 */

import { createMovieUtilityElement } from './movieStudioUtilityTestHarness.mjs';

export function createMovieUtilityView() {
	const names = ['commands', 'diagnostics', 'projects', 'renderJobs'];
	const utilityPanels = Object.fromEntries(names.map(name => {
		const panel = createMovieUtilityElement(`${name}-panel`);
		panel.hidden = true;
		return [name, panel];
	}));
	const utilityToggles = Object.fromEntries(names.map(name => [
		name,
		createMovieUtilityElement(`${name}-toggle`)
	]));
	return {
		commandCount: createMovieUtilityElement('command-count'),
		commandList: createMovieUtilityElement('command-list'),
		commandSearch: createMovieUtilityElement('command-search'),
		diagnosticsOutput: createMovieUtilityElement('diagnostics-output'),
		inspector: createMovieUtilityElement('inspector'),
		renderJobsList: createMovieUtilityElement('render-jobs'),
		root: { dataset: {} },
		statusBar: createMovieUtilityElement('status-bar'),
		statusFields: Object.fromEntries([
			'autosave',
			'instance',
			'render',
			'revision',
			'selection',
			'snapping'
		].map(name => [name, createMovieUtilityElement(name)])),
		timeline: createMovieUtilityElement('timeline'),
		utilityBackdrop: createMovieUtilityElement('backdrop'),
		utilityCloseButtons: [createMovieUtilityElement('close')],
		utilityPanels,
		utilityToggles,
		workspace: createMovieUtilityElement('workspace')
	};
}
