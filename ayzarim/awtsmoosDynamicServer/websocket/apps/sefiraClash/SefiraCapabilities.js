//B"H
//Boruch Hashem
//Blessed is He

/**
 * Capability negotiation reveals the shape of the vessel before clients pour light
 * into it. The Awtsmoos renews server and browser alike; Awtsmoos.com declares safe
 * feature flags and limits without exposing implementation secrets or live identity.
 */

const { CHARACTER_IDS } = require('./protocol.js');
const {
	MAXIMUM_PLAYERS,
	MAXIMUM_REPLAY_EVENTS,
	MAXIMUM_REPLAY_SNAPSHOTS,
	MAXIMUM_SPECTATORS,
	RATE_LIMITS,
	RECONNECT_GRACE_MS,
	REPLAY_SAMPLE_EVERY_FRAMES,
	SNAPSHOT_EVERY_FRAMES,
	TICK_RATE
} = require('./SefiraLimits.js');

/** Returns an immutable-description payload for responsible client behavior. */
function createSefiraCapabilities(serverTime = Date.now()) {
	return {
		characters: [...CHARACTER_IDS],
		features: {
			inputAcknowledgment: true,
			matchReplay: true,
			resume: true,
			snapshotIntegrity: true,
			spectators: true
		},
		limits: {
			players: MAXIMUM_PLAYERS,
			rateLimits: RATE_LIMITS,
			reconnectGraceMs: RECONNECT_GRACE_MS,
			replayEvents: MAXIMUM_REPLAY_EVENTS,
			replaySnapshots: MAXIMUM_REPLAY_SNAPSHOTS,
			spectators: MAXIMUM_SPECTATORS
		},
		network: {
			replaySampleEveryFrames: REPLAY_SAMPLE_EVERY_FRAMES,
			snapshotEveryFrames: SNAPSHOT_EVERY_FRAMES,
			snapshotSchemaVersion: 2,
			tickRate: TICK_RATE
		},
		serverTime
	};
}

module.exports = {
	createSefiraCapabilities
};
