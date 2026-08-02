// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MovieStudioWorkspaceModeController,
	classifyMovieStudioWorkspace
} from '../../movie/MovieStudioWorkspaceModeController.js';

test('workspace classifier follows mobile, tablet, and desktop bounds', () => {
	assert.equal(classifyMovieStudioWorkspace(390), 'mobile');
	assert.equal(classifyMovieStudioWorkspace(640), 'tablet');
	assert.equal(classifyMovieStudioWorkspace(980), 'tablet');
	assert.equal(classifyMovieStudioWorkspace(981), 'desktop');
});

test('workspace controller publishes mode and releases its observer', () => {
	let disconnected = false;
	let observed = null;
	const properties = new Map();
	const root = {
		classList: { toggle() {} },
		dataset: {},
		getBoundingClientRect: () => ({ width: 768 }),
		style: { setProperty: (name, value) => properties.set(name, value) }
	};
	class FakeResizeObserver {
		constructor(handler) { this.handler = handler; }
		observe(value) { observed = value; }
		disconnect() { disconnected = true; }
	}
	const events = [];
	const controller = new MovieStudioWorkspaceModeController(
		{ events: { emit: (name, value) => events.push({ name, value }) } },
		{ root },
		{ ResizeObserver: FakeResizeObserver, innerWidth: 768 }
	);
	assert.equal(observed, root);
	assert.equal(root.dataset.workspaceMode, 'tablet');
	assert.equal(properties.get('--movie-workspace-width'), '768px');
	assert.equal(events.at(-1).name, 'ui:workspace-mode');
	controller.destroy();
	assert.equal(disconnected, true);
});
