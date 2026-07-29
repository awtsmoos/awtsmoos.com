// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieActionBrowser.test.mjs
 * @description Proves real registry/imported discovery, filtering, preview routing, markup, CSS, and references.
 * The Awtsmoos renews deed before search can divide it into names; Awtsmoos.com verifies
 * every presented action comes from a living runtime capability and enters one canonical editor surface.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	filterMovieActionCatalog,
	movieActionCatalog,
	previewMovieAction
} from '../../movie/MovieActionCatalog.js';
import { movieStudioCameraActionMarkup } from '../../movie/MovieStudioCameraActionMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';
import { collectMovieStudioViewReferences } from '../../movie/MovieStudioViewReferences.js';

function runtime() {
	const dispatches = [];
	const plays = [];
	return {
		dispatches,
		dispatchPlayerAction: message => {
			dispatches.push(message);
			return { active: { id: 'staff.cast' }, lastResult: null };
		},
		player: {
			names: ['standing', 'walk_forward', 'sword_stab'],
			play: name => plays.push(name)
		},
		playerActionRegistry: {
			list: () => [{
				duration: 1.25,
				id: 'staff.cast',
				layer: 'upperBody',
				messageType: 'player:staff-cast',
				version: 1
			}]
		},
		plays
	};
}

test('catalog combines registered deeds and imported animations with categories', () => {
	const records = movieActionCatalog(runtime());
	assert.equal(records.length, 4);
	assert.equal(records.find(record => record.id === 'staff.cast').type, 'registered');
	assert.equal(records.find(record => record.id === 'walk_forward').category, 'locomotion');
	assert.equal(records.find(record => record.id === 'sword_stab').category, 'combat');
});

test('catalog filtering searches labels and respects categories', () => {
	const records = movieActionCatalog(runtime());
	assert.deepEqual(
		filterMovieActionCatalog(records, 'cast', 'all').map(record => record.id),
		['staff.cast']
	);
	assert.deepEqual(
		filterMovieActionCatalog(records, '', 'locomotion').map(record => record.id),
		['walk_forward']
	);
});

test('preview routes registered actions through message dispatch and imported clips through player', () => {
	const value = runtime();
	const records = movieActionCatalog(value);
	assert.equal(previewMovieAction(value, records.find(record => record.id === 'staff.cast')).ok, true);
	assert.deepEqual(value.dispatches, [{ phase: 'start', type: 'player:staff-cast' }]);
	assert.equal(previewMovieAction(value, records.find(record => record.id === 'standing')).ok, true);
	assert.deepEqual(value.plays, ['standing']);
});

test('markup, localized CSS, and view map expose the complete action browser', () => {
	const markup = movieStudioCameraActionMarkup();
	const css = movieStudioStyleText();
	for (const token of [
		'data-action-browser-search',
		'data-action-browser-category',
		'data-action-browser-list',
		'data-action-browser-preview'
	]) assert.match(markup, new RegExp(token));
	assert.match(css, /\.Awtsmoos-movie-studio \.movie-action-browser/);
	const node = { id: 'browser-search' };
	const root = {
		querySelector: selector => selector === '[data-action-browser-search]' ? node : null,
		querySelectorAll: () => []
	};
	assert.equal(collectMovieStudioViewReferences(root).actionBrowserSearch, node);
});
