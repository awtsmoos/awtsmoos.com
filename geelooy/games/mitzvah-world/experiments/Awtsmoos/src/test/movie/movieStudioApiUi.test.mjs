// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiUi.test.mjs
 * @description Proves serializable UI changes remain revision-neutral, persistent, observable, and bounded.
 * The Awtsmoos renews arrangement without changing the authored world; Awtsmoos.com
 * verifies agents can shape the studio while project history and revision remain untouched.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiHarness } from './movieStudioApiHarness.mjs';

test('UI domain changes density, theme, zoom, panes, and overlays without revision', () => {
	const { api, session } = createMovieStudioApiHarness();
	const events = [];
	api.events.on('ui:preferences', event => events.push(event));
	const result = api.ui.setPreferences({
		density: 'compact',
		inspectorWidth: 420,
		overlays: { thirds: true },
		previewZoom: '150%',
		theme: 'light',
		timelineHeight: 430,
		trackHeaderWidth: 200
	}, {
		expectedRevision: 1,
		requestId: 'ui-1'
	});
	assert.equal(result.ok, true);
	assert.equal(result.metadata.beforeRevision, 1);
	assert.equal(result.metadata.afterRevision, 1);
	assert.equal(result.metadata.requestId, 'ui-1');
	assert.equal(api.revision, 1);
	assert.equal(api.history.state().canUndo, false);
	assert.equal(api.ui.getPreferences().density, 'compact');
	assert.equal(api.ui.getPreferences().overlays.thirds, true);
	assert.equal(session.preferenceHarness.root.dataset.theme, 'light');
	assert.equal(events.length, 1);
});

test('UI preferences export, reset, and import round trip', () => {
	const { api } = createMovieStudioApiHarness();
	api.ui.setDensity('touch');
	api.ui.setTheme('neutral-dark');
	api.ui.setOverlay('center', true);
	const exported = api.ui.export();
	const reset = api.ui.resetPreferences();
	assert.equal(reset.ok, true);
	assert.equal(api.ui.getPreferences().density, 'comfortable');
	const imported = api.ui.import(exported);
	assert.equal(imported.ok, true);
	assert.equal(api.ui.getPreferences().density, 'touch');
	assert.equal(api.ui.getPreferences().theme, 'neutral-dark');
	assert.equal(api.ui.getPreferences().overlays.center, true);
	assert.equal(api.ui.export(), exported);
});

test('unknown overlay and stale UI revision return structured failures', () => {
	const { api } = createMovieStudioApiHarness();
	const unknown = api.ui.setOverlay('dangerous-overlay', true);
	assert.equal(unknown.ok, false);
	assert.equal(unknown.error.code, 'UNKNOWN_MOVIE_OVERLAY');
	const stale = api.ui.setDensity('compact', { expectedRevision: 99 });
	assert.equal(stale.ok, false);
	assert.equal(stale.error.code, 'STALE_MOVIE_REVISION');
	assert.equal(api.ui.getPreferences().density, 'comfortable');
});

test('root API serialization includes detached UI preferences', () => {
	const { api } = createMovieStudioApiHarness();
	api.ui.setPreviewZoom('200%');
	const serialized = JSON.parse(JSON.stringify(api));
	assert.equal(serialized.ui.previewZoom, '200%');
	assert.equal(serialized.revision, 1);
	assert.equal(serialized.project.title, 'API Harness Movie');
});
