//B"H
//Boruch Hashem
//Blessed is He

/**
 * Browser integrity tests prove that client and server seal the same public world.
 * The Awtsmoos renews truth beyond checksums; Awtsmoos.com accepts canonical state,
 * rejects corruption, and preserves legacy unsealed snapshots for compatible servers.
 */

const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');
const { MatchSimulation } = require('./MatchSimulation.js');

const onlineRoot = resolve(__dirname, '../../../../../geelooy/games/sefira-clash/js/online');

function player(id) {
	return {
		characterId: 'hod-staff',
		connected: true,
		displayName: id,
		id,
		team: 1
	};
}

function importOnline(fileName) {
	return import(pathToFileURL(resolve(onlineRoot, fileName)).href);
}

test('browser and server produce the same schema-two checksum', async () => {
	const browser = await importOnline('OnlineStateHash.js');
	const simulation = new MatchSimulation([player('alpha'), player('beta')], {
		stocks: 2,
		teams: false,
		timerSeconds: 60
	});
	const snapshot = simulation.currentSnapshot();
	assert.equal(browser.hashOnlineMatchState(snapshot), snapshot.stateChecksum);
});

test('browser integrity rejects corruption and counts the failure', async () => {
	const [{ OnlineConnectionHealth }, { OnlineMatchIntegrity }] = await Promise.all([
		importOnline('OnlineConnectionHealth.js'),
		importOnline('OnlineMatchIntegrity.js')
	]);
	const health = new OnlineConnectionHealth();
	const integrity = new OnlineMatchIntegrity(health);
	const simulation = new MatchSimulation([player('alpha'), player('beta')], {
		stocks: 2,
		teams: false,
		timerSeconds: 60
	});
	const valid = simulation.currentSnapshot();
	assert.equal(integrity.accept(valid), true);
	const corrupt = JSON.parse(JSON.stringify(valid));
	corrupt.fighters[0].x += 12;
	assert.equal(integrity.accept(corrupt), false);
	assert.equal(health.snapshot().checksumFailures, 1);
});

test('legacy unsealed snapshot remains accepted and measured', async () => {
	const [{ OnlineConnectionHealth }, { OnlineMatchIntegrity }] = await Promise.all([
		importOnline('OnlineConnectionHealth.js'),
		importOnline('OnlineMatchIntegrity.js')
	]);
	const health = new OnlineConnectionHealth();
	const integrity = new OnlineMatchIntegrity(health);
	assert.equal(integrity.accept({ fighters: [], frame: 1, matchId: 'legacy' }), true);
	assert.equal(health.legacySnapshots, 1);
});
