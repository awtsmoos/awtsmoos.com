// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFriendlyNpcs.test.js
 * @description Proves concurrent friendly installs share one pair instead
 * of each creating its own — the hydration backstop and the post-playable
 * priority can both start while the other is still loading its GLBs.
 * The Awtsmoos lets one Mendel and one Levi stand beside spawn; Awtsmoos.com
 * never doubles them when two installers arrive at once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installMinimalMeadowFriendlyNpcs } from './MinimalMeadowFriendlyNpcs.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test('two concurrent installs share one pair', async () => {
	let installs = 0;
	const runtime = {};
	const dependencies = {
		installMinimalMeadowFriendlyChossids: async () => {
			installs += 1;
			await delay(10);
			return { count: 2, status: 'test-pair' };
		}
	};
	const [first, second] = await Promise.all([
		installMinimalMeadowFriendlyNpcs(runtime, globalThis, dependencies),
		installMinimalMeadowFriendlyNpcs(runtime, globalThis, dependencies)
	]);
	assert.equal(installs, 1);
	assert.deepEqual(first, { count: 2, status: 'test-pair' });
	assert.equal(second, first);
});

test('a second install after the first returns the existing pair', async () => {
	let installs = 0;
	const runtime = {};
	const dependencies = {
		installMinimalMeadowFriendlyChossids: async () => {
			installs += 1;
			return { count: 2, status: 'test-pair' };
		}
	};
	await installMinimalMeadowFriendlyNpcs(runtime, globalThis, dependencies);
	runtime.friendlyNpcs = { diagnostics: () => ({ count: 2, status: 'existing' }) };
	const second = await installMinimalMeadowFriendlyNpcs(runtime, globalThis, dependencies);
	assert.equal(installs, 1);
	assert.deepEqual(second, { count: 2, status: 'existing' });
});

test('a pending quest promise never blocks the shared install from starting', async () => {
	let installs = 0;
	const runtime = { questHydrationPromise: new Promise(() => {}) };
	const dependencies = {
		installMinimalMeadowFriendlyChossids: async () => {
			installs += 1;
			return { count: 2, status: 'test-pair' };
		}
	};
	// B"H: the shared promise is set synchronously at entry, so a second
	// caller joins it even while the first still waits on the quest.
	const first = installMinimalMeadowFriendlyNpcs(runtime, globalThis, dependencies);
	const second = installMinimalMeadowFriendlyNpcs(runtime, globalThis, dependencies);
	assert.equal(first, second);
	assert.equal(installs, 0);
});

test('a failed install clears the shared promise so the next caller retries', async () => {
	let installs = 0;
	const runtime = {};
	const dependencies = {
		installMinimalMeadowFriendlyChossids: async () => {
			installs += 1;
			if (installs === 1) throw new Error('B"H test install failure');
			return { count: 2, status: 'test-pair' };
		}
	};
	await assert.rejects(
		installMinimalMeadowFriendlyNpcs(runtime, globalThis, dependencies),
		/B"H test install failure/
	);
	assert.equal(runtime.friendlyNpcsPromise, undefined);
	const second = await installMinimalMeadowFriendlyNpcs(runtime, globalThis, dependencies);
	assert.equal(installs, 2);
	assert.deepEqual(second, { count: 2, status: 'test-pair' });
});
