//B"H
//Boruch Hashem
//Blessed is He

/**
 * Input and health tests prove merged-device intention and truthful network math.
 * The Awtsmoos renews control and receipt beyond measurements; Awtsmoos.com reports
 * changes, frame gaps, latency, jitter, quality words, and reconnect status explicitly.
 */

const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const onlineRoot = resolve(__dirname, '../../../../../geelooy/games/sefira-clash/js/online');

function importOnline(fileName) {
	return import(pathToFileURL(resolve(onlineRoot, fileName)).href);
}

test('merges independent input sources without one erasing another', async () => {
	const { OnlineInputState } = await importOnline('OnlineInputState.js');
	const state = new OnlineInputState();
	const samples = [];
	state.subscribe(snapshot => samples.push(snapshot));
	state.set('keyboard', 'left', true);
	state.set('touch-1', 'attack', true);
	assert.deepEqual(state.snapshot(), {
		attack: true,
		guard: false,
		jump: false,
		left: true,
		right: false
	});
	state.clearSource('touch-1');
	assert.equal(state.snapshot().left, true);
	assert.equal(state.snapshot().attack, false);
	state.clearAll();
	assert.equal(Object.values(state.snapshot()).some(Boolean), false);
	assert.ok(samples.length >= 4);
});

test('measures latency, jitter, frame gaps, and human-readable quality', async () => {
	const { OnlineConnectionHealth } = await importOnline('OnlineConnectionHealth.js');
	const health = new OnlineConnectionHealth();
	health.setStatus('online');
	health.recordPong(1000, 1100, 1100);
	health.recordPong(2000, 2140, 2140);
	health.recordSnapshot({ frame: 2, matchId: 'match' }, 3000);
	health.recordSnapshot({ frame: 8, matchId: 'match' }, 3060);
	const snapshot = health.snapshot(3120);
	assert.equal(snapshot.latencyMs, 70);
	assert.ok(snapshot.jitterMs > 0);
	assert.equal(snapshot.frameGaps, 2);
	assert.equal(snapshot.snapshotAgeMs, 60);
	assert.equal(snapshot.quality, 'Excellent');
});

test('reconnect and checksum failure are visible without color dependence', async () => {
	const { OnlineConnectionHealth } = await importOnline('OnlineConnectionHealth.js');
	const health = new OnlineConnectionHealth();
	health.recordReconnectAttempt(3);
	assert.equal(health.snapshot().quality, 'Reconnecting');
	health.setStatus('online');
	health.recordChecksumFailure();
	assert.equal(health.snapshot().quality, 'Poor');
	assert.equal(health.snapshot().checksumFailures, 1);
});
