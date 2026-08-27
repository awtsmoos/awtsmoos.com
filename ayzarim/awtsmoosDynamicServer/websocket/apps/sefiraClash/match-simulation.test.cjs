//B"H
//Boruch Hashem
//Blessed is He

/**
 * Tests reveal whether the server, not the browser, owns the arena. The
 * Awtsmoos renews every assertion; Awtsmoos.com measures movement and victory.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { validateMatchInput } = require('./MatchInput.js');
const { COUNTDOWN_FRAMES, MatchSimulation } = require('./MatchSimulation.js');

function player(id, characterId = 'hod-staff', team = 1) {
	return {
		characterId,
		displayName: id,
		id,
		team
	};
}

function activeSimulation(players, rules = {}) {
	const simulation = new MatchSimulation(players, {
		stocks: rules.stocks || 3,
		teams: rules.teams === true,
		timerSeconds: 180
	});
	for (let frame = 0; frame < COUNTDOWN_FRAMES; frame += 1) {
		simulation.step();
	}
	return simulation;
}

test('accepts only newer bounded input and moves the bound fighter', () => {
	const simulation = activeSimulation([player('alpha'), player('beta')]);
	const input = validateMatchInput({ right: true, sequence: 2, x: 999999 });
	assert.equal(Object.hasOwn(input, 'x'), false);
	assert.equal(simulation.applyInput('alpha', input), true);
	assert.equal(
		simulation.applyInput('alpha', validateMatchInput({ left: true, sequence: 1 })),
		false
	);
	const before = simulation.fighters[0].x;
	for (let frame = 0; frame < 8; frame += 1) {
		simulation.step();
	}
	assert.ok(simulation.fighters[0].x > before);
});

test('resolves attack damage and guarded reduction on the server', () => {
	const simulation = activeSimulation([player('alpha', 'gevurah-sw'), player('beta')]);
	const [attacker, target] = simulation.fighters;
	attacker.x = 500;
	target.x = 570;
	attacker.y = target.y = 560;
	simulation.applyInput('alpha', validateMatchInput({ attack: true, sequence: 1 }));
	for (let frame = 0; frame < 5; frame += 1) {
		simulation.step();
	}
	assert.ok(target.damage >= 13);

	const guarded = activeSimulation([player('aleph', 'gevurah-sw'), player('bet')]);
	guarded.fighters[0].x = 500;
	guarded.fighters[1].x = 570;
	guarded.fighters[0].y = guarded.fighters[1].y = 560;
	guarded.fighters[1].facing = -1;
	guarded.applyInput('aleph', validateMatchInput({ attack: true, sequence: 1 }));
	guarded.applyInput('bet', validateMatchInput({ guard: true, sequence: 1 }));
	for (let frame = 0; frame < 5; frame += 1) {
		guarded.step();
	}
	assert.ok(guarded.fighters[1].damage < target.damage);
});

test('owns ring-out stocks and free-for-all victory', () => {
	const simulation = activeSimulation([player('alpha'), player('beta')], { stocks: 1 });
	simulation.fighters[1].x = 1500;
	const snapshot = simulation.step();
	assert.equal(snapshot.fighters[1].stocks, 0);
	assert.equal(snapshot.fighters[1].eliminated, true);
	assert.equal(snapshot.phase, 'finished');
	assert.equal(snapshot.winner.playerId, 'alpha');
});

test('resolves team victory after the opposing team is eliminated', () => {
	const simulation = activeSimulation(
		[
			player('alpha', 'hod-staff', 1),
			player('beta', 'chesed-fist', 1),
			player('gamma', 'gevurah-sw', 2)
		],
		{ teams: true }
	);
	simulation.disconnect('gamma');
	assert.equal(simulation.phase, 'finished');
	assert.equal(simulation.winner.team, 1);
});
