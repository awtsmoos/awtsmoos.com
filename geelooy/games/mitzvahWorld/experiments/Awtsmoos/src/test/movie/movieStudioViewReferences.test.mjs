// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioViewReferences.test.mjs
 * @description Proves semantic selectors map legacy controls, utilities, status facts, and responsive surfaces exactly.
 * The Awtsmoos renews every node beyond selector and reference; Awtsmoos.com verifies
 * controllers receive one truthful map so mobile sheets and desktop drawers never drift from markup.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { collectMovieStudioViewReferences } from '../../movie/MovieStudioViewReferences.js';

function fakeRoot() {
	const nodes = new Map();
	const selectors = [
		'[data-apply-json]', '[data-command-count]', '[data-command-list]',
		'[data-command-search]', '[data-copy-url]', '[data-density]',
		'[data-diagnostics-output]', '[data-inspector]', '[data-inspector-close]',
		'[data-inspector-toggle]', '[data-project-json]', '[data-play]',
		'[data-preview]', '[data-preview-frame]', '[data-preview-zoom]',
		'[data-render]', '[data-render-exact]', '[data-render-jobs-list]',
		'[data-status]', '[data-status-bar]', '[data-pause]', '[data-theme]',
		'[data-timeline]', '[data-title]', '[data-transform]',
		'[data-utility-backdrop]', '[data-workspace]'
	];
	for (const selector of selectors) nodes.set(selector, { selector });
	for (const name of ['autosave', 'instance', 'render', 'revision', 'selection', 'snapping']) {
		nodes.set(`[data-status-${name}]`, { name });
	}
	const overlayInputs = [{ id: 'overlay-one' }];
	const closeButtons = [{ dataset: { utilityClose: 'commands' } }];
	const panels = ['commands', 'renderJobs', 'diagnostics'].map(name => ({
		dataset: { utilityPanel: name }
	}));
	const toggles = ['commands', 'renderJobs', 'diagnostics'].map(name => ({
		dataset: { utilityToggle: name }
	}));
	return {
		nodes,
		overlayInputs,
		querySelector: selector => nodes.get(selector) || null,
		querySelectorAll(selector) {
			if (selector === '[data-overlay-toggle]') return overlayInputs;
			if (selector === '[data-utility-close]') return closeButtons;
			if (selector === '[data-utility-panel]') return panels;
			if (selector === '[data-utility-toggle]') return toggles;
			return [];
		}
	};
}

test('view references map current semantic selectors and named utility surfaces', () => {
	const root = fakeRoot();
	const view = collectMovieStudioViewReferences(root);
	assert.equal(view.apply.selector, '[data-apply-json]');
	assert.equal(view.stop.selector, '[data-pause]');
	assert.equal(view.copy.selector, '[data-copy-url]');
	assert.equal(view.json.selector, '[data-project-json]');
	assert.equal(view.statusBar.selector, '[data-status-bar]');
	assert.equal(view.utilityPanels.commands.dataset.utilityPanel, 'commands');
	assert.equal(view.utilityToggles.diagnostics.dataset.utilityToggle, 'diagnostics');
	assert.equal(view.utilityCloseButtons.length, 1);
	assert.deepEqual(view.overlayInputs, root.overlayInputs);
	assert.notEqual(view.overlayInputs, root.overlayInputs);
});

test('status fields map all six truthful facts', () => {
	const view = collectMovieStudioViewReferences(fakeRoot());
	assert.deepEqual(Object.keys(view.statusFields).sort(), [
		'autosave', 'instance', 'render', 'revision', 'selection', 'snapping'
	]);
	assert.equal(view.statusFields.selection.name, 'selection');
});
