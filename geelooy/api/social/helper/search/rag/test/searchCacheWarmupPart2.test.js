//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file searchCacheWarmupPart2.test.js
 * @description Background vector warmup case moved verbatim from searchCacheWarmup.test.js.
 */
const assert = require('node:assert/strict');
const test = require('node:test');

test('background vector warmup opens sessions and probes vector lanes', async () => {
	const { warmVectorSessions } = require('../searchCacheWarmup.js');
	const calls = [];
	const session = {
		database: {
			vector: {
				nearestIndexed(list, vector, limit) {
					calls.push(['probe', vector.length, limit]);
					return [];
				}
			}
		},
		list: {}
	};
	const lanes = [
		{
			id: 'test-lane',
			vectorEnabled: true,
			dimensions: 4,
			parts: [
				{ file: '/tmp/probe-1.awtsdb', dimensions: 4 },
				{ file: '/tmp/probe-2.awtsdb', dimensions: 4 }
			]
		},
		{ id: 'text-lane', vectorEnabled: false, parts: [{ file: '/tmp/skip.awtsdb' }] }
	];
	const started = warmVectorSessions({ db: { directory: '/tmp/x' } }, {
		describedShards: async () => lanes,
		groupedLanes: shards => shards,
		openShardSession: part => {
			calls.push(['open', part.file]);
			return session;
		},
		beginSemanticWarmup: () => {
			calls.push(['semantic']);
		}
	});
	assert.deepEqual(started, { started: true });
	const deadline = Date.now() + 5000;
	while (!calls.some(entry => entry[0] === 'probe') && Date.now() < deadline) {
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	assert.ok(calls.some(entry => entry[0] === 'semantic'), 'semantic worker warmup started');
	assert.ok(calls.some(entry => entry[0] === 'open' && entry[1] === '/tmp/probe-1.awtsdb'));
	assert.ok(calls.some(entry => entry[0] === 'open' && entry[1] === '/tmp/probe-2.awtsdb'));
	assert.ok(!calls.some(entry => entry[0] === 'open' && entry[1] === '/tmp/skip.awtsdb'));
	assert.ok(calls.some(entry => entry[0] === 'probe' && entry[1] === 4 && entry[2] === 5));
});