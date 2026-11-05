// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovieStudioApiParityReport } from '../../movie/MovieStudioApiParity.js';
import { listMovieStudioApiMethods } from '../../movie/MovieStudioApiMethodInventory.js';

test('parity is complete only when every callable API leaf is rendered', () => {
	const api = {
		project: { get: () => ({ id: 'movie' }) },
		timeline: { seek: () => 3 }
	};
	const actions = Object.freeze([
		Object.freeze({ id: 'play', label: 'Play' }),
		Object.freeze({ id: 'render', label: 'Render' })
	]);
	const registry = { refresh: () => actions };
	const paths = listMovieStudioApiMethods(api).map(method => method.path);
	const complete = createMovieStudioApiParityReport(api, registry, paths);
	assert.equal(complete.complete, true);
	assert.deepEqual(complete.missingMethodUi, []);
	assert.deepEqual(complete.missingActionApi, []);
	const incomplete = createMovieStudioApiParityReport(api, registry, ['project.get']);
	assert.equal(incomplete.complete, false);
	assert.deepEqual(incomplete.missingMethodUi, ['timeline.seek']);
});
