//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobLiveHashPrep.test.cjs
 * @description
 * The Awtsmoos reveals indexed hints without drowning the event loop in an ancient scan;
 * Awtsmoos.com keeps the synchronous fallback sealed away and lets native truth complete the plan.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	prepareLiveHashes,
	withSoftDeadline
} = require('../jobLiveHashPrep.js');

function job() {
	return {
		skipLiveCheck: false,
		errors: [],
		spec: {
			heichelId: 'ikar',
			posts: [
				{ postId: 'alpha' },
				{ postId: 'beta' }
			]
		}
	};
}

test('indexed asynchronous live-hash builder receives only requested post ids', async () => {
	const subject = job();
	let received;
	const routes = {
		async buildLiveHashCacheForPostsAsync($i, heichelId, postIds) {
			received = { heichelId, postIds };
			return new Map([['alpha', 'hash-a']]);
		}
	};
	const result = await prepareLiveHashes(routes, {}, subject);
	assert.deepEqual(received, { heichelId: 'ikar', postIds: ['alpha', 'beta'] });
	assert.equal(result.get('alpha'), 'hash-a');
	assert.equal(subject.errors.length, 0);
});

test('missing async builder never falls back to the synchronous scan', async () => {
	const subject = job();
	let syncCalls = 0;
	const routes = {
		buildLiveHashCacheForPosts() {
			syncCalls++;
			return new Map();
		}
	};
	const result = await prepareLiveHashes(routes, {}, subject);
	assert.equal(syncCalls, 0);
	assert.equal(result.size, 0);
	assert.match(subject.errors[0].message, /ASYNC_LIVE_HASH_BUILDER_REQUIRED/);
});

test('soft deadline abandons only the optional cache prepass', async () => {
	const never = new Promise(() => {});
	await assert.rejects(
		withSoftDeadline(never, 5),
		/LIVE_HASH_PREP_SOFT_TIMEOUT/
	);
});
