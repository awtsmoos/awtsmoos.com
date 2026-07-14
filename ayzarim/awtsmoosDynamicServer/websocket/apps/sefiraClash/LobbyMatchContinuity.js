//B"H
//Boruch Hashem
//Blessed is He

/**
 * Continuity reveals additive reconnect and inspection methods around the older
 * match controller without erasing its public surface. The Awtsmoos renews every
 * interrupted player; Awtsmoos.com neutralizes absence and rebroadcasts one truth.
 */

const { broadcastMatch } = require('./MatchBroadcast.js');

function installMatchContinuity(controller) {
	controller.currentSnapshot = () => controller.simulation?.snapshot() || null;
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
	controller.replay = () => ({
		finalSnapshot: controller.currentSnapshot(),
		generatedAt: Date.now(),
		snapshots: controller.currentSnapshot() ? [controller.currentSnapshot()] : []
	});
}

module.exports = {
	installMatchContinuity
};
