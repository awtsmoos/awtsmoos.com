//B"H
//Boruch Hashem
//Blessed is He

/**
 * Integrity and replay tests verify that public history derives from authoritative
 * state. The Awtsmoos renews every frame; Awtsmoos.com seals canonical projection,
 * records measured statistics, credits ring-outs, and bounds remembered snapshots.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MatchJournal } = require('./MatchJournal.js');
const { COUNTDOWN_FRAMES, MatchSimulation } = require('./MatchSimulation.js');
const { hashMatchState } = require('./MatchStateHash.js');

function player(id, characterId = 'hod-staff') {
	return {
		characterId,
		connected: true,
		displayName: id,
		id,
		team: 1
	};
}

function activeSimulation(stocks = 2) {
	const simulation = new MatchSimulation([player('alpha', 'gevurah-sw'), player('beta')], {
		stocks,
		teams: false,
		timerSeconds: 60
	});
	for (let frame = 0; frame < COUNTDOWN_FRAMES; frame += 1) {
		simulation.step();
	}
	return simulation;
}

test('seals canonical public state and detects corruption', () => {
	const simulation = activeSimulation();
	const snapshot = simulation.currentSnapshot();
	assert.equal(snapshot.schemaVersion, 2);
	assert.equal(hashMatchState(snapshot), snapshot.stateChecksum);
	const corrupted = JSON.parse(JSON.stringify(snapshot));
	corrupted.fighters[0].x += 1;
	assert.notEqual(hashMatchState(corrupted), snapshot.stateChecksum);
});

test('records authoritative hit, damage, fall, and ring-out statistics', () => {
	const simulation = activeSimulation(1);
	const [attacker, target] = simulation.fighters;
	attacker.x = 500;
	target.x = 570;
	attacker.y = target.y = 560;
	simulation.applyInput('alpha', {
		attack: true,
		guard: false,
		jump: false,
		left: false,
		right: false,
		sequence: 1
	});
	for (let frame = 0; frame < 5; frame += 1) {
		simulation.step();
	}
	assert.ok(attacker.stats.damageDealt > 0);
	assert.equal(attacker.stats.hitsLanded, 1);
	assert.equal(target.stats.hitsReceived, 1);
	target.x = 1500;
	const finished = simulation.step();
	assert.equal(finished.phase, 'finished');
	assert.equal(attacker.stats.ringOuts, 1);
	assert.equal(target.stats.falls, 1);
	assert.equal(finished.fighters[0].statistics.ringOuts, 1);
});

test('exports bounded public replay after a completed match', () => {
	const simulation = activeSimulation(1);
	simulation.fighters[1].x = 1500;
	simulation.step();
	const replay = simulation.replay();
	assert.equal(replay.matchId, simulation.matchId);
	assert.equal(replay.finalSnapshot.phase, 'finished');
	assert.ok(replay.snapshots.length > 0);
	assert.ok(replay.events.some(event => event.type === 'finished'));
	assert.equal(JSON.stringify(replay).includes('resumeToken'), false);
	assert.equal(JSON.stringify(replay).includes('client'), false);
});

test('journal trims old snapshots and events to declared bounds', () => {
	const journal = new MatchJournal('bounded');
	for (let frame = 0; frame < 12000; frame += 10) {
		journal.recordSnapshot({ frame }, true);
		journal.recordEvent(frame, 'sample', { frame });
	}
	const replay = journal.export({ frame: 12000 });
	assert.ok(replay.snapshots.length <= 1800);
	assert.ok(replay.events.length <= 1000);
	assert.equal(replay.events.at(-1).payload.frame, 11990);
});
