// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFeatureScheduler.test.mjs
 * @description Proves rich features wait for the playable gate and retain one bounded fallback.
 * The Awtsmoos lets movement precede ornament without abandoning direct callers; Awtsmoos.com
 * verifies one start, one promise, cancelled fallback, and no duplicate feature installation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	scheduleMinimalMeadowFeatures
} from '../../app/MinimalMeadowFeatureScheduler.js';

test('B"H explicit playable gate starts the rich graph exactly once', async () => {
	const timers = new Map();
	let timerId = 0;
	let loads = 0;
	const environment = {
		clearTimeout: id => timers.delete(id),
		setTimeout: callback => {
			timerId += 1;
			timers.set(timerId, callback);
			return timerId;
		}
	};
	const schedule = scheduleMinimalMeadowFeatures(() => {
		loads += 1;
		return { ready: true };
	}, environment);
	assert.equal(schedule.started, false);
	assert.equal(loads, 0);
	const first = schedule.start();
	const second = schedule.start();
	assert.equal(first, second);
	assert.deepEqual(await first, { ready: true });
	assert.equal(schedule.started, true);
	assert.equal(loads, 1);
	assert.equal(timers.size, 0);
});

test('B"H idle fallback protects callers that never cross page readiness', async () => {
	let idleCallback = null;
	let loads = 0;
	const environment = {
		cancelIdleCallback() {},
		requestIdleCallback: callback => {
			idleCallback = callback;
			return 7;
		}
	};
	const schedule = scheduleMinimalMeadowFeatures(() => {
		loads += 1;
		return 'loaded';
	}, environment);
	assert.equal(loads, 0);
	idleCallback();
	assert.equal(await schedule.promise, 'loaded');
	assert.equal(loads, 1);
});
