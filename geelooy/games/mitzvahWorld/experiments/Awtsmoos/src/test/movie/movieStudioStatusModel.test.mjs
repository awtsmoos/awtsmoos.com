// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioStatusModel.test.mjs
 * @description Proves status labels tell the truth about selected clips, snapping, autosave, renders, instance, and revision.
 * The Awtsmoos renews every measured fact beyond badge and word; Awtsmoos.com verifies
 * mobile and desktop never claim saving, rendering, selection, or identity without finite evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioStatusModel } from '../../movie/MovieStudioStatusModel.js';

function fakeSession(overrides = {}) {
	return {
		autosave: {
			state: () => ({
				active: false,
				lastSavedRevision: null,
				pending: false,
				...(overrides.autosave || {})
			})
		},
		commands: {
			state: () => ({
				selectionCount: overrides.selectionCount || 0,
				snapping: overrides.snapping !== false
			})
		},
		instanceRegistry: {
			list: () => overrides.instances || []
		},
		project: { title: overrides.title || 'Fallback Studio' },
		renderQueue: {
			list: () => overrides.jobs || []
		},
		revision: overrides.revision || 1
	};
}

test('idle model reports finite defaults without optimistic claims', () => {
	const model = createMovieStudioStatusModel(fakeSession());
	assert.deepEqual(model, {
		autosave: 'Autosave off',
		instance: 'Fallback Studio',
		render: 'Render idle',
		revision: 'Revision 1',
		selection: '0 selected',
		snapping: 'Snapping on'
	});
	assert.equal(Object.isFrozen(model), true);
});

test('autosave labels distinguish ready, pending, and saved revision', () => {
	assert.equal(createMovieStudioStatusModel(fakeSession({
		autosave: { active: true }
	})).autosave, 'Autosave ready');
	assert.equal(createMovieStudioStatusModel(fakeSession({
		autosave: { active: true, pending: true }
	})).autosave, 'Autosave pending');
	assert.equal(createMovieStudioStatusModel(fakeSession({
		autosave: { active: true, lastSavedRevision: 7 }
	})).autosave, 'Saved revision 7');
});

test('active render takes priority over failed history and failed state remains visible', () => {
	const active = { progress: 0.4, state: 'rendering' };
	const failed = { progress: 1, state: 'failed' };
	assert.equal(createMovieStudioStatusModel(fakeSession({
		jobs: [failed, active]
	})).render, '1 render active');
	assert.equal(createMovieStudioStatusModel(fakeSession({
		jobs: [failed, failed]
	})).render, '2 render failed');
});

test('selection, snapping, active instance, and revision reflect live state', () => {
	const model = createMovieStudioStatusModel(fakeSession({
		instances: [{ active: true, title: 'Second Studio' }],
		revision: 12,
		selectionCount: 3,
		snapping: false
	}));
	assert.equal(model.selection, '3 selected');
	assert.equal(model.snapping, 'Snapping off');
	assert.equal(model.instance, 'Second Studio');
	assert.equal(model.revision, 'Revision 12');
});
