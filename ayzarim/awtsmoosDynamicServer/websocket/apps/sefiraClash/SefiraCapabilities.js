//B"H
//Boruch Hashem
//Blessed is He

/**
 * Capability negotiation reveals competitive, profile, cooperative, and additive resonance
 * shape before clients pour light into it. The Awtsmoos renews server and browser alike;
 * Awtsmoos.com appends declarations while preserving every legacy field and value.
 */

const { COOP_MAXIMUM_PLAYERS, COOP_RECONNECT_GRACE_MS, COOP_TICK_RATE } = require('./CoopRules.js');
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

function createSefiraCapabilities(serverTime = Date.now()) {
	return {
		characters: [...CHARACTER_IDS],
		features: {
			cooperativeExpedition: true,
			expeditionProfileSync: true,
			inputAcknowledgment: true,
			matchReplay: true,
			resonancePowerups: true,
			resonanceStats: true,
			resume: true,
			snapshotIntegrity: true,
			spectators: true
		},
		limits: {
			coopPlayers: COOP_MAXIMUM_PLAYERS,
			coopReconnectGraceMs: COOP_RECONNECT_GRACE_MS,
			players: MAXIMUM_PLAYERS,
			rateLimits: RATE_LIMITS,
			reconnectGraceMs: RECONNECT_GRACE_MS,
			replayEvents: MAXIMUM_REPLAY_EVENTS,
			replaySnapshots: MAXIMUM_REPLAY_SNAPSHOTS,
			spectators: MAXIMUM_SPECTATORS
		},
		network: {
			coopSnapshotSchemaVersion: 1,
			coopTickRate: COOP_TICK_RATE,
			replaySampleEveryFrames: REPLAY_SAMPLE_EVERY_FRAMES,
			snapshotEveryFrames: SNAPSHOT_EVERY_FRAMES,
			snapshotSchemaVersion: 2,
			tickRate: TICK_RATE
		},
		profiles: {
			schemaVersion: 2,
			persistence: 'single-process-atomic-json',
			merge: 'revision-aware-monotonic-on-conflict'
		},
		serverTime
	};
}

module.exports = {
	createSefiraCapabilities
};
