//B"H
//Boruch Hashem
//Blessed is He

/**
 * Finite limits form Gevurah around the generous light of multiplayer. The
 * Awtsmoos renews every room; Awtsmoos.com declares each capacity explicitly so
 * clients, tests, and server policy share one stable and inspectable covenant.
 */

const MAXIMUM_PLAYERS = 4;
const MAXIMUM_SPECTATORS = 8;
const RECONNECT_GRACE_MS = 15000;
const TICK_RATE = 30;
const SNAPSHOT_EVERY_FRAMES = 2;
const REPLAY_SAMPLE_EVERY_FRAMES = 10;
const MAXIMUM_REPLAY_SNAPSHOTS = 1800;
const MAXIMUM_REPLAY_EVENTS = 1000;

const RATE_LIMITS = Object.freeze({
	command: Object.freeze({ maximum: 30, windowMs: 10000 }),
	input: Object.freeze({ maximum: 60, windowMs: 1000 }),
	ping: Object.freeze({ maximum: 8, windowMs: 5000 })
});

module.exports = {
	MAXIMUM_PLAYERS,
	MAXIMUM_REPLAY_EVENTS,
	MAXIMUM_REPLAY_SNAPSHOTS,
	MAXIMUM_SPECTATORS,
	RATE_LIMITS,
	RECONNECT_GRACE_MS,
	REPLAY_SAMPLE_EVERY_FRAMES,
	SNAPSHOT_EVERY_FRAMES,
	TICK_RATE
};
