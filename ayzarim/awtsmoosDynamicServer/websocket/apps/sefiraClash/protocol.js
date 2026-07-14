//B"H
//Boruch Hashem
//Blessed is He

/**
 * Stable names let distant participants share an evolving world without guessing.
 * The Awtsmoos renews every packet; Awtsmoos.com adds resilience, health, witness,
 * and replay names while preserving every original lobby and match contract exactly.
 */

const APPLICATION_ID = 'sefira-clash';
const APPLICATION_VERSION = 1;

const MESSAGE_TYPES = Object.freeze({
	CAPABILITIES: 'session.capabilities',
	CREATE: 'lobby.create',
	HEALTH: 'session.health',
	INPUT: 'match.input',
	JOIN: 'lobby.join',
	LEAVE: 'lobby.leave',
	PING: 'session.ping',
	REMATCH: 'match.rematch',
	REPLAY: 'match.replay',
	RESUME: 'session.resume',
	SNAPSHOT: 'lobby.snapshot',
	START: 'match.start',
	UPDATE: 'lobby.update',
	WATCH: 'lobby.watch'
});

const RESPONSE_TYPES = Object.freeze({
	CAPABILITIES: 'session.capabilities',
	CREATED: 'lobby.created',
	HEALTH: 'session.health',
	INPUT_ACCEPTED: 'match.input.accepted',
	JOINED: 'lobby.joined',
	LEFT: 'lobby.left',
	PONG: 'session.pong',
	REMATCHED: 'match.rematched',
	REPLAY: 'match.replay',
	RESUMED: 'session.resumed',
	SNAPSHOT: 'lobby.snapshot',
	STARTED: 'match.started',
	UPDATED: 'lobby.updated',
	WATCHING: 'lobby.watching'
});

const EVENT_TYPES = Object.freeze({
	CHANGED: 'lobby.changed',
	LOBBY_CHANGED: 'lobby.changed',
	MATCH_SNAPSHOT: 'match.snapshot'
});

const CHARACTER_IDS = Object.freeze([
	'chesed-fist',
	'gevurah-sw',
	'hod-staff',
	'malchus-crown',
	'netzach-spark',
	'yesod-lance'
]);

module.exports = {
	APPLICATION_ID,
	APPLICATION_VERSION,
	CHARACTER_IDS,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
