//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalUniversalOperations.test.mjs
 * @description Proves the universal Portal doorway validates, discovers, inspects, queries, explains, revises, diffs, and generates arbitrary representation-only semantic kinds truthfully.
 * The Awtsmoos is beyond every noun while finite language may name worlds without end; Awtsmoos.com lets these witnesses prove
 * that immense semantic reach remains deterministic, immutable, inspectable, and honest when specialist execution is still deferred around the bend.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createDeferredPortalKind,
	createProceduralPortal
} from '../src/index.js';

/**
 * @description Creates one Portal extended with an arbitrary representation-only semantic kind used by universal-operation tests.
 * @returns {object} Immutable ProceduralPortal facade with the `anything` alias installed.
 */
function createAnythingPortal() {
	return createProceduralPortal({ budget: 'preview', seed: 'anything-proof' }).with({
		kinds: [createDeferredPortalKind({
			aliases: ['anything'],
			description: 'Arbitrary semantic world entity.',
			kind: 'world.anything'
		})]
	});
}

/**
 * @description Creates one rich semantic intent carrying canonical trait descriptors, relationships, behavior, and payload evidence.
 * @returns {object} Friendly Portal intent for the deferred anything kind.
 */
function createAnythingIntent() {
	return {
		behaviors: [{ id: 'pulse', type: 'pulse' }],
		id: 'thing-a',
		kind: 'anything',
		relationships: [{ id: 'near-home', target: 'home', type: 'near' }],
		traits: {
			mood: { values: { value: 'calm' } }
		},
		value: 'dream'
	};
}

test('B"H | universal Portal validates, discovers, inspects, queries, and explains intent', () => {
	const portal = createAnythingPortal();
	const intent = createAnythingIntent();
	const validation = portal.validate(intent);
	assert.equal(validation.ok, true);
	assert.equal(portal.validate({ kind: 'missing.kind' }).ok, false);
	const capabilities = portal.capabilities('anything');
	assert.equal(capabilities.kind.kind, 'world.anything');
	assert.equal(capabilities.kind.capabilities.execution, 'deferred');
	assert.equal(capabilities.operations.generate, 'native-specialist');
	assert.equal(capabilities.operations.explain, 'native');
	const inspection = portal.inspect(intent);
	assert.equal(inspection.nodes[0].traits.mood.values.value, 'calm');
	assert.equal(inspection.nodes[0].root, true);
	assert.equal(portal.query(intent, { trait: 'mood' }).count, 1);
	assert.equal(portal.query(intent, { kind: 'anything', text: 'dream' }).count, 1);
	const explanation = portal.explain(intent);
	assert.equal(explanation.planHash, inspection.planHash);
	assert.deepEqual(explanation.summary.kinds, ['world.anything']);
});

test('B"H | universal revision and diff preserve semantic lineage immutably', () => {
	const portal = createAnythingPortal();
	const intent = createAnythingIntent();
	const parent = portal.inspect(intent).nodes[0];
	const revised = portal.revise(intent, {
		traits: {
			mood: { values: { value: 'radiant' } },
			season: { values: { value: 'spring' } }
		}
	});
	assert.equal(revised.id, 'thing-a');
	assert.equal(revised.kind, 'world.anything');
	assert.equal(revised.revision, parent.revision + 1);
	assert.equal(revised.provenance.derivedFrom, 'thing-a');
	assert.equal(revised.traits.mood.values.value, 'radiant');
	assert.equal(revised.traits.season.values.value, 'spring');
	assert.equal(intent.traits.mood.values.value, 'calm');
	const delta = portal.diff(intent, revised);
	assert.equal(delta.summary.changed, 1);
	assert.equal(delta.changed[0].before.id, 'thing-a');
	assert.ok(delta.changed[0].changes.length > 0);
});

test('B"H | generate realizes arbitrary deferred semantic kinds without false native output', async () => {
	const portal = createAnythingPortal();
	const generated = await portal.generate(createAnythingIntent());
	assert.equal(generated.result.type, 'portal.deferred-artifact');
	assert.equal(generated.result.status, 'deferred');
	assert.equal(generated.get('thing-a').kind, 'world.anything');
	assert.equal(generated.world.resources.objects['thing-a'].metadata.portal.kind, 'world.anything');
});
