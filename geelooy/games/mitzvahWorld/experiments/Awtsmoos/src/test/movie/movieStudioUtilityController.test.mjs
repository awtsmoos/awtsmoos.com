// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilityController.test.mjs
 * @description Proves command execution, relevant refresh, focus, inertness, and complete teardown.
 * The Awtsmoos renews shortcut and surface before ordinary editing can collide; Awtsmoos.com
 * verifies that action enters safely, closes truthfully, and releases every listener and modal trace.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioUtilityController } from '../../movie/MovieStudioUtilityController.js';
import { installMovieUtilityDom } from './movieStudioUtilityTestHarness.mjs';
import { createMovieUtilitySession } from './movieStudioUtilitySessionHarness.mjs';
import { createMovieUtilityView } from './movieStudioUtilityViewHarness.mjs';

function keyEvent(key, options = {}) {
	return {
		ctrlKey: false,
		key,
		metaKey: false,
		prevented: false,
		preventDefault() {
			this.prevented = true;
		},
		...options
	};
}

test('Mod/Ctrl+K opens commands and Enter executes the first safe entry', () => {
	const restore = installMovieUtilityDom();
	try {
		const view = createMovieUtilityView();
		const harness = createMovieUtilitySession();
		const controller = new MovieStudioUtilityController(harness.session, view);
		const open = keyEvent('k', { ctrlKey: true });
		assert.equal(controller.onKeyDown(open), true);
		assert.equal(open.prevented, true);
		assert.equal(controller.state.activeName, 'commands');
		assert.equal(document.activeElement, view.commandSearch);
		assert.equal(view.commandList.children.length, 1);
		const execute = keyEvent('Enter');
		assert.equal(controller.onKeyDown(execute), true);
		assert.equal(execute.prevented, true);
		assert.deepEqual(harness.calls.execute, ['history.undo']);
		assert.equal(controller.state.activeName, null);
		assert.equal(
			harness.session.view.status.textContent,
			'2 selected · history.undo complete.'
		);
		controller.destroy();
	} finally {
		restore();
	}
});

test('only relevant events refresh the active surface and projects delegate', () => {
	const restore = installMovieUtilityDom();
	try {
		const view = createMovieUtilityView();
		const harness = createMovieUtilitySession();
		const controller = new MovieStudioUtilityController(harness.session, view);
		const refreshed = [];
		controller.content.refresh = name => refreshed.push(name);
		controller.open('diagnostics');
		assert.deepEqual(refreshed, ['diagnostics']);
		harness.emit('playback:frame');
		assert.deepEqual(refreshed, ['diagnostics']);
		harness.emit('render:state');
		assert.deepEqual(refreshed, ['diagnostics', 'diagnostics']);
		controller.open('projects');
		assert.equal(harness.calls.projectRefresh, 1);
		controller.destroy();
	} finally {
		restore();
	}
});

test('destroy removes subscriptions, DOM listeners, resize, and mobile inertness', () => {
	const restore = installMovieUtilityDom();
	try {
		globalThis.matchMedia = () => ({ matches: true });
		const view = createMovieUtilityView();
		const harness = createMovieUtilitySession();
		const controller = new MovieStudioUtilityController(harness.session, view);
		controller.open('diagnostics');
		assert.equal(view.workspace.inert, true);
		assert.equal(window.listenerCount('resize'), 1);
		assert.equal(view.renderJobsList.listenerCount('click'), 1);
		assert.equal(view.commandSearch.listenerCount('input'), 1);
		controller.destroy();
		assert.equal(harness.unsubscribeCount(), 2);
		assert.equal(window.listenerCount('resize'), 0);
		assert.equal(view.renderJobsList.listenerCount('click'), 0);
		assert.equal(view.commandSearch.listenerCount('input'), 0);
		assert.equal(view.workspace.inert, false);
		assert.equal(view.utilityBackdrop.hidden, true);
		for (const toggle of Object.values(view.utilityToggles)) {
			assert.equal(toggle.listenerCount('click'), 0);
		}
	} finally {
		restore();
	}
});
