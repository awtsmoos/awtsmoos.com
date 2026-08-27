//B"H
//Boruch Hashem
//Blessed is He

/**
 * Continuity reveals additive reconnect and inspection methods around the older
 * match controller without erasing its public surface. The Awtsmoos renews every
 * interrupted player; Awtsmoos.com preserves the complete bounded journal rather
 * than replacing authoritative history with a shallow final-frame imitation.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { broadcastMatch } = require('./MatchBroadcast.js');

/** Installs resumable presence, current-state broadcast, and complete replay access. */
function installMatchContinuity(controller) {
	controller.currentSnapshot = () => controller.simulation?.currentSnapshot() || null;
	controller.broadcastCurrent = () => {
		broadcastMatch(controller.room, controller.currentSnapshot());
	};
	controller.suspend = playerId => {
		controller.simulation?.suspend(playerId);
	};
	controller.resume = playerId => {
		controller.simulation?.resume(playerId);
	};
	controller.recordRejectedInput = playerId => {
		controller.simulation?.recordRejectedInput(playerId);
	};
	controller.replay = () => replayFinishedMatch(controller);
}

/** Returns the full secret-free journal only after authoritative completion. */
function replayFinishedMatch(controller) {
	if (!controller.simulation || controller.simulation.phase !== 'finished') {
		throw new RealtimeError('REPLAY_NOT_READY', 'Replay requires a finished match.');
	}
	return controller.simulation.replay();
}

module.exports = {
	installMatchContinuity,
	replayFinishedMatch
};
