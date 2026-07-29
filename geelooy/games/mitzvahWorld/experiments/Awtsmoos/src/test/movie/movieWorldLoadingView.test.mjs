// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieWorldLoadingView.test.mjs
 * @description Proves progress semantics and that unbound actions remain hidden.
 * The Awtsmoos is beyond every button while honest interfaces reveal only possible deeds;
 * Awtsmoos.com verifies loading state, bounded percentage, and recovery needs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { updateMovieWorldLoadingView } from '../../movie/MovieWorldLoadingView.js';

function view(overrides = {}) {
	const attributes = {};
	const properties = {};
	return {
		attributes,
		cancel: { hidden: true },
		details: { textContent: '' },
		hasCancel: false,
		hasRetry: false,
		progress: {
			parentElement: { setAttribute: (name, value) => { attributes[name] = value; } },
			style: { setProperty: (name, value) => { properties[name] = value; } }
		},
		properties,
		retry: { hidden: true },
		root: {
			dataset: {},
			setAttribute: (name, value) => { attributes[name] = value; }
		},
		stage: { textContent: '' },
		...overrides
	};
}

test('loading state clamps progress and hides unbound actions', () => {
	const target = view();
	updateMovieWorldLoadingView(target, {
		details: 'Terrain ready',
		label: 'Loading actors',
		progress: 1.5,
		status: 'loading'
	});
	assert.equal(target.attributes['aria-valuenow'], '100');
	assert.equal(target.properties['--movie-loading-progress'], '100%');
	assert.equal(target.stage.textContent, 'Loading actors');
	assert.equal(target.cancel.hidden, true);
	assert.equal(target.retry.hidden, true);
});

test('bound recovery actions appear only in compatible states', () => {
	const target = view({ hasCancel: true, hasRetry: true });
	updateMovieWorldLoadingView(target, { status: 'error' });
	assert.equal(target.cancel.hidden, false);
	assert.equal(target.retry.hidden, false);
	updateMovieWorldLoadingView(target, { progress: 1, status: 'ready' });
	assert.equal(target.cancel.hidden, true);
	assert.equal(target.retry.hidden, true);
	assert.equal(target.attributes['aria-busy'], 'false');
});
