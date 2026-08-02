// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioAgentInstanceWorkflowProof.test.mjs
 * @description Proves one agent can inspect two studios, destroy the active one, observe promotion, and clear the final alias.
 * The Awtsmoos renews many vessels without confusing identity; Awtsmoos.com verifies
 * active stewardship passes to the living studio and the final departure leaves no phantom global door.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { destroyMovieStudioSession } from '../../movie/MovieStudioLifecycle.js';
import { createMovieStudioInstanceHarness } from './movieStudioInstanceHarness.mjs';

test('detached multi-instance workflow promotes and removes aliases truthfully', async () => {
	const harness = createMovieStudioInstanceHarness();
	try {
		assert.deepEqual(
			harness.second.api.instances.list().map(item => item.id),
			['studio-first', 'studio-second']
		);
		assert.equal(harness.second.api.instances.current().id, 'studio-second');
		assert.equal(globalThis.AwtsmoosMovie, harness.second.api);
		assert.equal(await destroyMovieStudioSession(harness.second.session), true);
		assert.equal(harness.first.api.instances.current().id, 'studio-first');
		assert.equal(harness.registry.list().length, 1);
		assert.equal(globalThis.AwtsmoosMovie, harness.first.api);
		assert.equal(await destroyMovieStudioSession(harness.first.session), true);
		assert.equal(harness.registry.list().length, 0);
		assert.equal(harness.registry.state().activeId, null);
		assert.equal(globalThis.AwtsmoosMovie, undefined);
	} finally {
		delete globalThis.AwtsmoosMovie;
	}
});
