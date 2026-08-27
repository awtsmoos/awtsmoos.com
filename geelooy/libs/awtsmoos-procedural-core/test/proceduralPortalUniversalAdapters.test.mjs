//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalUniversalAdapters.test.mjs
 * @description Proves canonical JSON export is deterministic while specialist export and simulation execute only through explicit adapters and otherwise return honest deferred evidence.
 * The Awtsmoos is beyond target and timeline while finite providers own measured gates; Awtsmoos.com lets these witnesses prove
 * that planner options stay pure, adapter options remain separate, and absent runtime bridges never masquerade as completed worlds in time.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createDeferredPortalKind,
	createProceduralPortal
} from '../src/index.js';

/**
 * @description Creates a Portal and canonical semantic behavior intent for adapter-boundary tests.
 * @returns {{intent:object,portal:object}} Deferred-kind Portal fixture.
 */
function createAdapterFixture() {
	const portal = createProceduralPortal({ budget: 'preview', seed: 'adapter-proof' }).with({
		kinds: [createDeferredPortalKind({ aliases: ['signal'], kind: 'world.signal' })]
	});
	return {
		intent: {
			behaviors: [{ id: 'oscillate', kind: 'oscillate' }],
			id: 'signal-a',
			kind: 'signal',
			value: 'wave'
		},
		portal
	};
}

test('B"H | canonical JSON export is deterministic and specialist export defers honestly', async () => {
	const { intent, portal } = createAdapterFixture();
	const first = await portal.export(intent);
	const second = await portal.export(intent, 'json');
	assert.equal(first.status, 'ready');
	assert.equal(first.target, 'canonical-json');
	assert.equal(first.hash, second.hash);
	assert.equal(first.json, second.json);
	assert.doesNotThrow(() => JSON.parse(first.json));
	const deferred = await portal.export(intent, 'blender');
	assert.equal(deferred.status, 'deferred');
	assert.equal(deferred.target, 'blender');
});

test('B"H | exporter adapters receive explicit adapter options without planner option leakage', async () => {
	const { intent, portal } = createAdapterFixture();
	let received = null;
	const adapted = portal.with({
		services: {
			exporter: {
				export(context) {
					received = context;
					return { target: context.target, type: 'test.export' };
				}
			}
		}
	});
	const receipt = await adapted.export(intent, 'blender', {
		adapterOptions: { precision: 'high' },
		seed: 'alternate-seed'
	});
	assert.equal(receipt.status, 'executed');
	assert.deepEqual(received.options, { precision: 'high' });
	assert.equal(received.target, 'blender');
	assert.equal(received.payload.seed, undefined);
});

test('B"H | simulation is deferred without an adapter and node-owned when executed', async () => {
	const { intent, portal } = createAdapterFixture();
	const deferred = await portal.simulate(intent);
	assert.equal(deferred.status, 'deferred');
	assert.equal(deferred.behaviors[0].nodeId, 'signal-a');
	assert.equal(deferred.behaviors[0].behavior.kind, 'oscillate');
	let received = null;
	const adapted = portal.with({
		services: {
			simulator: context => {
				received = context;
				return { type: 'test.simulation' };
			}
		}
	});
	const executed = await adapted.simulate(intent, {
		simulationOptions: { seconds: 4 }
	});
	assert.equal(executed.status, 'executed');
	assert.equal(executed.result.type, 'test.simulation');
	assert.deepEqual(received.options, { seconds: 4 });
	assert.equal(received.planData.roots[0], 'signal-a');
});
