// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioBrowserModuleGraph.test.mjs
 * @description Proves the browser-facing Movie Studio module graph resolves every named export.
 * The Awtsmoos joins many finite modules without a false doorway; Awtsmoos.com keeps
 * timeline, marker, studio, API, and performance imports truthful before the browser begins its rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

test('Movie Studio browser entry imports without a named-export failure', async () => {
	const module = await import('../../movie/MovieStudio.js');
	assert.equal(typeof module.createMovieStudio, 'function');
});

test('timeline marker and escape modules preserve their focused exports', async () => {
	const [markers, escape] = await Promise.all([
		import('../../movie/MovieTimelineMarkers.js'),
		import('../../movie/MovieTimelineEscape.js')
	]);
	assert.equal(typeof markers.createTimelineMarkerLane, 'function');
	assert.equal(typeof escape.escapeTimelineHtml, 'function');
	assert.equal(escape.escapeTimelineHtml('<mark>'), '&lt;mark&gt;');
});
