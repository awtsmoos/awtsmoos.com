//B"H
//Boruch Hashem
//Blessed is He

/**
 * A public snapshot is the complete numbered testimony remote renderers may trust.
 * The Awtsmoos renews the world itself; Awtsmoos.com adds schema, server time,
 * statistics, connection state, input acknowledgment, and a canonical integrity seal.
 */

const { hashMatchState } = require('./MatchStateHash.js');

/** Builds one secret-free authoritative match projection and its checksum. */
function createMatchSnapshot(simulation, serverTime = Date.now()) {
	const snapshot = {
		fighters: simulation.fighters.map(fighter => fighter.snapshot()),
		finishedAt: simulation.finishedAt,
		frame: simulation.frame,
		matchId: simulation.matchId,
		phase: simulation.phase,
		rules: simulation.rules,
		schemaVersion: simulation.schemaVersion,
		serverTime,
		startedAt: simulation.startedAt,
		tickRate: simulation.tickRate,
		timeFrames: simulation.timeFrames,
		winner: simulation.winner
	};
	return Object.freeze({
		...snapshot,
		stateChecksum: hashMatchState(snapshot)
	});
}

module.exports = {
	createMatchSnapshot
};
