//B"H
//Boruch Hashem
//Blessed is He

/**
 * Stable names let distant participants share VS, profiles, and cooperative roads
 * without guessing. The Awtsmoos renews every packet; Awtsmoos.com appends new light
 * while preserving every established lobby and match contract exactly.
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
	WATCH: 'lobby.watch',
	PROFILE_PULL: 'expedition.profile.pull',
	PROFILE_PUSH: 'expedition.profile.push',
	COOP_CREATE: 'expedition.coop.create',
	COOP_JOIN: 'expedition.coop.join',
	COOP_UPDATE: 'expedition.coop.update',
	COOP_START: 'expedition.coop.start',
	COOP_INPUT: 'expedition.coop.input',
	COOP_SNAPSHOT: 'expedition.coop.snapshot',
	COOP_RESUME: 'expedition.coop.resume',
	COOP_REMATCH: 'expedition.coop.rematch',
	COOP_LEAVE: 'expedition.coop.leave'
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
	WATCHING: 'lobby.watching',
	PROFILE: 'expedition.profile',
	PROFILE_SAVED: 'expedition.profile.saved',
	COOP_CREATED: 'expedition.coop.created',
	COOP_JOINED: 'expedition.coop.joined',
	COOP_UPDATED: 'expedition.coop.updated',
	COOP_STARTED: 'expedition.coop.started',
	COOP_INPUT_ACCEPTED: 'expedition.coop.input.accepted',
	COOP_SNAPSHOT: 'expedition.coop.snapshot',
	COOP_RESUMED: 'expedition.coop.resumed',
	COOP_REMATCHED: 'expedition.coop.rematched',
	COOP_LEFT: 'expedition.coop.left'
});

const EVENT_TYPES = Object.freeze({
	CHANGED: 'lobby.changed',
	LOBBY_CHANGED: 'lobby.changed',
	MATCH_SNAPSHOT: 'match.snapshot',
	COOP_CHANGED: 'expedition.coop.changed',
	COOP_SNAPSHOT: 'expedition.coop.snapshot'
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
