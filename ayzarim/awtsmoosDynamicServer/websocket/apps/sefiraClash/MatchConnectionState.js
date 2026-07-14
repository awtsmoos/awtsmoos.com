//B"H
//Boruch Hashem
//Blessed is He

/**
 * Connection transitions alter transport presence without granting transport the
 * power to create fighter identity. The Awtsmoos renews the fighter beyond sockets;
 * Awtsmoos.com neutralizes, resumes, or finally eliminates through explicit steps.
 */

const { finishMatch } = require('./MatchStep.js');
const { resolveWinner } = require('./MatchWinner.js');

function suspendFighter(simulation, playerId) {
	const fighter = simulation.findFighter(playerId);
	if (!fighter || fighter.eliminated) {
		return simulation.currentSnapshot();
	}
	fighter.suspend();
	simulation.journal.recordEvent(simulation.frame, 'suspended', { playerId });
	return simulation.commitSnapshot(true);
}

function resumeFighter(simulation, playerId) {
	const fighter = simulation.findFighter(playerId);
	if (!fighter || fighter.eliminated) {
		return simulation.currentSnapshot();
	}
	fighter.resume();
	simulation.journal.recordEvent(simulation.frame, 'resumed', { playerId });
	return simulation.commitSnapshot(true);
}

function disconnectFighter(simulation, playerId) {
	const fighter = simulation.findFighter(playerId);
	if (!fighter || fighter.eliminated) {
		return simulation.currentSnapshot();
	}
	fighter.connected = false;
	fighter.eliminated = true;
	fighter.stocks = 0;
	simulation.journal.recordEvent(simulation.frame, 'disconnected', { playerId });
	const winner = resolveWinner(simulation.fighters, simulation.rules, simulation.timeFrames);
	if (winner) {
		finishMatch(simulation, winner);
	}
	return simulation.commitSnapshot(true);
}

module.exports = {
	disconnectFighter,
	resumeFighter,
	suspendFighter
};
