//B"H
//Boruch Hashem
//Blessed is He

/**
 * One fixed step orders physics, combat, time, victory, journaling, and checksummed
 * projection. The Awtsmoos renews each frame whole; Awtsmoos.com keeps this order
 * explicit so tests and replays cannot inherit accidental browser-side authority.
 */

const { stepCombat } = require('./MatchCombat.js');
const { stepFighterPhysics } = require('./MatchPhysics.js');
const { resolveWinner } = require('./MatchWinner.js');

function stepMatch(simulation) {
	if (simulation.phase === 'finished') {
		return simulation.currentSnapshot();
	}
	simulation.frame += 1;
	if (simulation.phase === 'countdown') {
		stepCountdown(simulation);
		return simulation.commitSnapshot();
	}
	stepActive(simulation);
	return simulation.commitSnapshot(simulation.phase === 'finished');
}

function stepCountdown(simulation) {
	if (simulation.frame < simulation.countdownFrames) {
		return;
	}
	simulation.phase = 'active';
	simulation.journal.recordEvent(simulation.frame, 'phase', { phase: 'active' });
}

function stepActive(simulation) {
	const context = {
		fighters: simulation.fighters,
		frame: simulation.frame,
		journal: simulation.journal
	};
	for (const fighter of simulation.fighters) {
		stepFighterPhysics(fighter, context);
	}
	stepCombat(simulation.fighters, context);
	simulation.timeFrames = Math.max(0, simulation.timeFrames - 1);
	const winner = resolveWinner(simulation.fighters, simulation.rules, simulation.timeFrames);
	if (winner) {
		finishMatch(simulation, winner);
	}
}

function finishMatch(simulation, winner) {
	simulation.finishedAt = Date.now();
	simulation.phase = 'finished';
	simulation.winner = winner;
	simulation.journal.recordEvent(simulation.frame, 'finished', { winner });
}

module.exports = {
	finishMatch,
	stepMatch
};
