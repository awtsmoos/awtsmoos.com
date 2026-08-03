// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowOptionalBranch.test.mjs
 * @description Proves named optional deadlines settle success and expose exact timeout identity.
 * The Awtsmoos gives every later garment a measured hour while the playable world remains free;
 * Awtsmoos.com verifies elapsed evidence, timer cleanup, branch names, and bounded rejection.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowOptionalBranch,
	minimalMeadowOptionalBranchTimeouts
} from '../../app/MinimalMeadowOptionalBranch.js';

test('B"H fulfilled branch records identity and clears its deadline', async () => {
	const environment = fakeEnvironment();
	const receipt = await createMinimalMeadowOptionalBranch(
		'player',
		Promise.resolve({ ready: true }),
		120000,
		environment
	);
	assert.equal(receipt.name, 'player');
	assert.equal(receipt.status, 'fulfilled');
	assert.deepEqual(receipt.value, { ready: true });
	assert.equal(environment.cleared.length, 1);
});

test('B"H pending branch rejects with its exact name and timeout', async () => {
	const environment = fakeEnvironment();
	const promise = createMinimalMeadowOptionalBranch(
		'terrain',
		new Promise(() => {}),
		210000,
		environment
	);
	assert.equal(environment.timers.length, 1);
	environment.timers[0].callback();
	await assert.rejects(promise, /terrain:timeout-210000ms/);
});

test('B"H public optional deadlines fit inside the browser gate', () => {
	const timeouts = minimalMeadowOptionalBranchTimeouts();
	assert.equal(timeouts.terrain, 210000);
	assert.equal(timeouts.visual, 210000);
	assert.ok(Object.values(timeouts).every(value => value <= 210000));
});

function fakeEnvironment() {
	let clock = 1000;
	return {
		cleared: [],
		performance: {
			now() {
				clock += 5;
				return clock;
			}
		},
		timers: [],
		clearTimeout(handle) {
			this.cleared.push(handle);
		},
		setTimeout(callback, delay) {
			const handle = { callback, delay, unref() {} };
			this.timers.push(handle);
			return handle;
		}
	};
}
