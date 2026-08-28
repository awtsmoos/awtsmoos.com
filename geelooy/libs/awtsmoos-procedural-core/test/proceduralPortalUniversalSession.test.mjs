//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalUniversalSession.test.mjs
 * @description Proves world sessions query, diff, immutably revise, mutate, and remove only canonically resolved authored roots while preserving other roots untouched.
 * The Awtsmoos gathers many roots without confusing one branch for another; Awtsmoos.com lets these witnesses prove
 * that fluent world authoring remains exact, lineage-aware, deterministic, and guarded against missing identities across every semantic endeavor.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createDeferredPortalKind,
	createProceduralPortal
} from '../src/index.js';

/**
 * @description Creates one two-root world whose kinds compile only to explicit deferred semantic artifacts and whose traits use canonical descriptor values.
 * @returns {{portal:object,world:object}} Portal and mutable authoring session fixture.
 */
function createSessionFixture() {
	const portal = createProceduralPortal({ budget: 'preview', seed: 'session-universal' }).with({
		kinds: [createDeferredPortalKind({ aliases: ['idea'], kind: 'world.idea' })]
	});
	const world = portal.world([
		{
			id: 'idea-a',
			kind: 'idea',
			traits: { tone: { values: { value: 'calm' } } },
			value: 'alpha'
		},
		{
			id: 'idea-b',
			kind: 'idea',
			traits: { tone: { values: { value: 'bright' } } },
			value: 'beta'
		}
	]);
	return { portal, world };
}

test('B"H | world session query and diff use current canonical semantic roots', () => {
	const { portal, world } = createSessionFixture();
	const original = world.inputs();
	const roots = world.query({ root: true });
	assert.equal(roots.count, 2);
	assert.deepEqual(roots.items.map(item => item.id), ['idea-a', 'idea-b']);
	world.revise('idea-a', {
		traits: {
			season: { values: { value: 'spring' } },
			tone: { values: { value: 'radiant' } }
		}
	});
	const revised = world.inputs()[0];
	assert.equal(revised.id, 'idea-a');
	assert.equal(revised.revision, 2);
	assert.equal(revised.provenance.derivedFrom, 'idea-a');
	assert.equal(revised.traits.tone.values.value, 'radiant');
	assert.equal(revised.traits.season.values.value, 'spring');
	assert.equal(world.inputs()[1].value, 'beta');
	const delta = portal.diff(original, world.inputs());
	assert.equal(delta.summary.changed, 1);
	assert.equal(delta.summary.unchanged, 1);
});

test('B"H | world session mutation is revision and removal targets only resolved roots', () => {
	const { world } = createSessionFixture();
	world.mutate('idea-b', {
		traits: { tone: { values: { value: 'golden' } } }
	});
	assert.equal(world.inputs()[1].traits.tone.values.value, 'golden');
	assert.equal(world.inputs()[1].revision, 2);
	world.remove('idea-a');
	assert.deepEqual(world.plan().roots, ['idea-b']);
	assert.throws(
		() => world.remove('missing-root'),
		error => error instanceof RangeError && /not found/.test(error.message)
	);
});

test('B"H | world session semantic operations survive deferred compilation', async () => {
	const { world } = createSessionFixture();
	world.revise('idea-a', {
		traits: { tone: { values: { value: 'deep' } } }
	});
	const result = await world.compile();
	assert.equal(result.result, null);
	assert.equal(result.get('idea-a').result.status, 'deferred');
	assert.equal(result.get('idea-b').result.status, 'deferred');
	assert.equal(world.query({ text: 'deep' }).count, 1);
});
