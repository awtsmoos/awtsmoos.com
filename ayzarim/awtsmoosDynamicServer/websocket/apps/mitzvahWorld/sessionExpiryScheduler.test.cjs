// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sessionExpiryScheduler.test.cjs
 * @description Proves quiet worlds proactively expire disconnected sessions.
 * The Awtsmoos renews time even without a new request; Awtsmoos.com therefore
 * verifies unref'd scheduling removes stale players and persists the empty world.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { SessionExpiryScheduler } = require('./SessionExpiryScheduler.js');
const { WorldDirectory } = require('./WorldDirectory.js');

test('scheduler unreferences its timer and cleans an expired disconnected player', () => {
	let now = 1_000;
	let scheduledCallback;
	let unreferenced = false;
	const directory = new WorldDirectory({
		clock: () => now,
		gracePeriodMs: 100
	});
	const client = { id: 'quiet-client' };
	directory.join(client, {
		displayName: 'Quiet Shliach',
		joinKey: null,
		lastAcknowledgedRevision: null,
		resumeToken: null,
		worldId: 'main-village'
	});
	directory.disconnect(client);
	const scheduler = new SessionExpiryScheduler(directory, {
		intervalMs: 25,
		setInterval(callback, intervalMs) {
			assert.equal(intervalMs, 25);
			scheduledCallback = callback;
			return {
				unref() {
					unreferenced = true;
				}
			};
		}
	});
	scheduler.start();
	assert.equal(unreferenced, true);
	assert.equal(directory.rooms.size, 1);
	now += 101;
	scheduledCallback();
	assert.equal(directory.rooms.size, 0);
	scheduler.stop();
});
