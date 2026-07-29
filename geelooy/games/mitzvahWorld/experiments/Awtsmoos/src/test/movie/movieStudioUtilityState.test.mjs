// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilityState.test.mjs
 * @description Proves desktop non-modal drawers and mobile modal sheets, inertness, ARIA, Escape, and focus return.
 * The Awtsmoos renews open and closed beyond width and device; Awtsmoos.com verifies
 * keyboard and touch enter one bounded surface while background, backdrop, focus, and attributes remain honest.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioUtilityState } from '../../movie/MovieStudioUtilityState.js';

function element(name) {
	const attributes = new Map();
	return {
		attributes,
		focusCount: 0,
		hidden: true,
		inert: false,
		isConnected: true,
		name,
		focus() { this.focusCount += 1; },
		getAttribute: key => attributes.get(key) || null,
		querySelectorAll: () => [],
		setAttribute: (key, value) => attributes.set(key, String(value))
	};
}

function view() {
	return {
		commandSearch: element('search'),
		inspector: element('inspector'),
		root: { dataset: {} },
		statusBar: element('status'),
		timeline: element('timeline'),
		utilityBackdrop: element('backdrop'),
		utilityPanels: {
			commands: element('commands'),
			diagnostics: element('diagnostics'),
			renderJobs: element('renderJobs')
		},
		utilityToggles: {
			commands: element('commands-toggle'),
			diagnostics: element('diagnostics-toggle'),
			renderJobs: element('render-toggle')
		},
		workspace: element('workspace')
	};
}

test('desktop opens non-modal drawer without backdrop or inert background', () => {
	const target = view();
	const state = new MovieStudioUtilityState(target, { isCompact: () => false });
	assert.equal(state.open('commands', target.utilityToggles.commands), true);
	assert.equal(target.utilityPanels.commands.hidden, false);
	assert.equal(target.utilityPanels.commands.attributes.get('aria-modal'), 'false');
	assert.equal(target.utilityBackdrop.hidden, true);
	assert.equal(target.workspace.inert, false);
	assert.equal(target.timeline.inert, false);
	assert.equal(target.commandSearch.focusCount, 1);
	assert.equal(target.utilityToggles.commands.attributes.get('aria-expanded'), 'true');
});

test('mobile opens modal sheet with backdrop and inert background', () => {
	const target = view();
	const state = new MovieStudioUtilityState(target, { isCompact: () => true });
	state.open('renderJobs', target.utilityToggles.renderJobs);
	assert.equal(target.utilityPanels.renderJobs.attributes.get('aria-modal'), 'true');
	assert.equal(target.utilityBackdrop.hidden, false);
	for (const background of [
		target.workspace,
		target.timeline,
		target.inspector,
		target.statusBar
	]) {
		assert.equal(background.inert, true);
	}
	assert.equal(target.utilityPanels.renderJobs.focusCount, 1);
});

test('opening another surface closes the first and updates every toggle', () => {
	const target = view();
	const state = new MovieStudioUtilityState(target, { isCompact: () => false });
	state.open('commands', target.utilityToggles.commands);
	state.open('diagnostics', target.utilityToggles.diagnostics);
	assert.equal(target.utilityPanels.commands.hidden, true);
	assert.equal(target.utilityPanels.diagnostics.hidden, false);
	assert.equal(target.utilityToggles.commands.attributes.get('aria-expanded'), 'false');
	assert.equal(target.utilityToggles.diagnostics.attributes.get('aria-expanded'), 'true');
});

test('Escape closes, restores opener focus, and removes mobile inertness', () => {
	const target = view();
	const state = new MovieStudioUtilityState(target, { isCompact: () => true });
	const event = { key: 'Escape', prevented: false, preventDefault() { this.prevented = true; } };
	state.open('diagnostics', target.utilityToggles.diagnostics);
	assert.equal(state.onKeyDown(event), true);
	assert.equal(event.prevented, true);
	assert.equal(state.activeName, null);
	assert.equal(target.utilityBackdrop.hidden, true);
	assert.equal(target.workspace.inert, false);
	assert.equal(target.utilityToggles.diagnostics.focusCount, 1);
});

test('destroy closes without restoring focus and leaves no inert background', () => {
	const target = view();
	const state = new MovieStudioUtilityState(target, { isCompact: () => true });
	state.open('commands', target.utilityToggles.commands);
	state.destroy();
	assert.equal(state.activeName, null);
	assert.equal(target.workspace.inert, false);
	assert.equal(target.utilityBackdrop.hidden, true);
	assert.equal(target.utilityToggles.commands.focusCount, 0);
});
